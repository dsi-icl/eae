const timer = require('timers');
const request = require('request');
const { Constants, ErrorHelper } =  require('eae-utils');

/**
 * @class JobsScheduler
 * @desc Periodic scheduling and managing of jobs - Job Statuses Managed: Queued, Error, Cancelled, Done
 * @param mongoHelper Helper class to interact with Mongo
 * @constructor
 */
function JobsScheduler(mongoHelper) {
    // Init member attributes
    this._mongoHelper = mongoHelper;

    //Bind member functions
    this.startPeriodicUpdate = JobsScheduler.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = JobsScheduler.prototype.stopPeriodicUpdate.bind(this);

    // Action Methods
    this._queuedJobs = JobsScheduler.prototype._queuedJobs.bind(this);
    this._errorJobs = JobsScheduler.prototype._errorJobs.bind(this);
    this._canceledOrDoneJobs = JobsScheduler.prototype._canceledOrDoneJobs.bind(this);
    this._reportFailedJob = JobsScheduler.prototype._reportFailedJob.bind(this);
    this._freeComputeResources= JobsScheduler.prototype._freeComputeResources.bind(this);
}

/**
 * @fn _freeComputeResources
 * @desc Free all compute resources allocated to a specific job, e.g. workers of a spark cluster.
 * @param job Job to process
 * @private
 */
JobsScheduler.prototype._freeComputeResources= function(job){
    let _this = this;

    switch (job.type) {
        case Constants.EAE_JOB_TYPE_SPARK:
            let filter = {
                ip: job.executorIP,
                port: job.executorPort
            };
            _this._mongoHelper.retrieveNodesStatus(filter).then(
                function(node){
                    let sparkCluster = node[0].cluster;
                    sparkCluster.forEach(function(node){
                        node.status = Constants.EAE_SERVICE_STATUS_IDLE;
                        node.statusLock = false;
                        _this._mongoHelper.updateNodeStatus(node);
                    });
                },
                function(error){
                    ErrorHelper('Failed to retrieve nodes status. Filter:' + filter.toString(), error);
                }
            );
            break;
        default:
            break;
    }
};

/**
 * @fn _reportFailedJob
 * @desc We archive the failed job and check if the executor for the job exceeds the threshold for failed jobs
 * @param job Failed job
 * @private
 */
JobsScheduler.prototype._reportFailedJob = function(job){
    let _this = this;

    // We archive the failed job and check if the executor for the job exceeds the threshold for failed jobs
    _this._mongoHelper.archiveFailedJob(job).then(function () {
            var currentTime = new Date();

            let filter = {
                executorPort : job.executorPort,
                executorIP : job.executorIP,
                startDate: {
                    '$ge': new Date(currentTime.setHours(currentTime.getDay() - 7))
                }
            };
            _this._mongoHelper.retrieveFailedJobs(filter).then(function(failedJobs){
                if(failedJobs.length > 3){
                    let node = {
                        ip : job.executorIP,
                        port : job.executorPort,
                        status : Constants.EAE_SERVICE_STATUS_DEAD,
                        statusLock : true
                    };
                    // lock the node and set status to dead
                    _this._mongoHelper.updateNodeStatus(node).then(
                        function(success){
                        if(success.nModified === 1){
                            console.log('The node' + node.ip + ':' + node.port + 'has been set to DEAD successfully ' +
                                'following excessive job failures');
                        }else{
                            ErrorHelper('Something went horribly wrong when locking the node and setting to DEAD. Node: '
                                + node.ip + ' ' + node.port);
                        }},function(error){
                            ErrorHelper('Failed to lock the node and set its status to DEAD. Node: '
                                + node.ip + ' ' + node.port, error);
                        });
                }
            },function(error){
                ErrorHelper('Failed to retrieve failed jobs for executor:' + filter.toString(), error);
            });
        },function (error){
            ErrorHelper('Failed to archive failed Job. Job:' + job._id, error);
        }

    );
};


JobsScheduler.prototype._queuedJobs = function () {
};

/**
 * @fn _errorJobs
 * @desc Periodic processing of the Jobs in error. We report the failed job & executor, free all resources and
 * queue again the job.
 * @returns {Promise}
 * @private
 */
JobsScheduler.prototype._errorJobs = function () {
    let _this = this;
    return new Promise(function(resolve, reject) {
        let statuses = [Constants.EAE_JOB_STATUS_ERROR];

        let filter = {
            "status.0": {$in: statuses},
            statusLock: false,
        };

        _this._mongoHelper.retrieveJobs(filter).then(function (jobs) {
            jobs.forEach(function (job) {
                // We set the lock
                job.statusLock = true;
                // lock the Job
                _this._mongoHelper.updateJob(job).then(
                    function (res) {
                        if (res.nModified === 1) {
                            // We report the failed executor and archive the failed job
                            _this._reportFailedJob(job);
                            // We free all the compute resources
                            _this._freeComputeResources(job);
                            job.statusLock = false;
                            job.status.unshift(Constants.EAE_JOB_STATUS_QUEUED);
                            _this._mongoHelper.updateJob(job).then(function(success_res){
                                if(success_res.nModified === 1){
                                    resolve('The job in error has been successfully Queued and executor reported');
                                }else{
                                    reject(ErrorHelper('Something went terribly wrong when unlocking and Queueing job.' +
                                        ' JobId: ' + job._id));
                                }
                            },function(error){
                                reject(ErrorHelper('Failed to unlock the job ' + job._id + ' and set it back to Queued',
                                    error));
                            });
                        }else{
                            resolve('The Job in error ' + job._id.toString() + ' has already been processed.');
                        }
                    },
                    function (error) {
                        reject(ErrorHelper('Failed to lock the job. Filter:' + job._id, error));
                    });
            });
        },function (error) {
            reject(ErrorHelper('Failed to retrieve Jobs. Filter:' + filter.toString(), error));
        });
    });
};

/**
 * @fn _canceledOrDoneJobs
 * @desc Periodic processing of the Jobs in state cancelled or done. We free all resources and set the jobs to completed.
 * @returns {Promise}
 * @private
 */
JobsScheduler.prototype._canceledOrDoneJobs = function () {
    let _this = this;
    return new Promise(function(resolve, reject) {
        let statuses = [Constants.EAE_JOB_STATUS_CANCELLED, Constants.EAE_JOB_STATUS_DONE];

        let filter = {
            "status.0": {$in: statuses},
            statusLock: false,
        };

        _this._mongoHelper.retrieveJobs(filter).then(function (jobs) {
            jobs.forEach(function (job) {
                // We set the lock
                job.statusLock = true;
                // lock the Job
                _this._mongoHelper.updateJob(job).then(
                    function (res) {
                        if (res.nModified === 1) {
                            //  We free all the compute resources
                            _this._freeComputeResources(job);
                            job.statusLock = false;
                            job.status.unshift(Constants.EAE_JOB_STATUS_COMPLETED);
                            _this._mongoHelper.updateJob(job).then(function(success_res){
                                if(success_res.nModified === 1){
                                    resolve('The job in error has been successfully set to completed and all resources freed.');
                                }else{
                                    reject(ErrorHelper('Something went terribly wrong when unlocking and setting ' +
                                        'the job to completed. JobId: ' + job._id));
                                }
                            },function(error){
                                reject(ErrorHelper('Failed to unlock the job ' + job._id + ' and set it back to Queued',
                                    error));
                            });
                        }
                    }, function (error) {
                        reject(ErrorHelper('Failed to lock the job. Filter:' + job._id, error));
                    });
            }, function (error) {
                reject(ErrorHelper('Failed to retrieve Jobs. Filter:' + filter.toString(), error));
            });
        });
    });
};

/**
 * @fn startPeriodicUpdate
 * @desc Start an automatic scheduling, error processing and post processing of the Jobs
 * @param delay The intervals (in milliseconds) on how often to update the status
 */
JobsScheduler.prototype.startPeriodicUpdate = function(delay = Constants.STATUS_DEFAULT_UPDATE_INTERVAL) {
    let _this = this;

    //Stop previous interval if any
    _this.stopPeriodicUpdate();
    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){
        _this._queuedJobs(); // Schedule Pending Jobs
        _this._errorJobs(); // Reschedule failed Jobs
        _this._canceledOrDoneJobs(); // Post processing of cancelled and done Jobs
    }, delay);
};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation of the compute status of the nodes
 * Does nothing if the periodic update was not running
 */
JobsScheduler.prototype.stopPeriodicUpdate = function() {
    let _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

module.exports = JobsScheduler;
