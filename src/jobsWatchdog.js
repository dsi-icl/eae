const timer = require('timers');
const { ErrorHelper, Constants } =  require('eae-utils');

/**
 * @class JobsWatchdog
 * @desc Periodic monitoring of jobs - Archive completed jobs, Invalidate timing out jobs
 * @param mongoHelper Helper class to interact with Mongo
 * @param swiftHelper Helper class to interact with Swift
 * @constructor
 */
function JobsWatchdog(mongoHelper, swiftHelper) {
    //Init member vars
    this._intervalTimeout = null;
    this._mongoHelper = mongoHelper;
    this._swiftHelper = swiftHelper;

    //Bind member functions
    this.startPeriodicUpdate = JobsWatchdog.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = JobsWatchdog.prototype.stopPeriodicUpdate.bind(this);

    // Action Methods
    this._deleteSwiftFilesAndContainer = JobsWatchdog.prototype._deleteSwiftFilesAndContainer.bind(this);
    this._archiveJobs = JobsWatchdog.prototype._archiveJobs.bind(this);
    // this._invalidateTimingOutJobs = JobsWatchdog.prototype._invalidateTimingOutJobs.bind(this);
}

JobsWatchdog.prototype._deleteSwiftFilesAndContainer = function(container, filesArray) {
    let _this = this;

    if(Array.isArray(filesArray)) {
        let filesToBeDeleted = [];
        filesArray.forEach(function (file) {
            let d = _this._swiftHelper.deleteFile(container, file).then(
                function (_unused_deleteStatus) {
                    console.log('File : ' + file + ' has been successfully deleted from container : ' + container);
                },
                function (error) {
                    ErrorHelper('Failed to delete file in swift: container - '
                        + container + ' file - ' + file, error);
                }
            );
            filesToBeDeleted.push(d);
        });

        Promise.all(filesToBeDeleted).then(function (_unused_array) {
            _this._swiftHelper.deleteContainer(container);
        }, function (error) {
            ErrorHelper('Failed to delete conatiner:' + container, error);
        });
    }
};

/**
 * @fn _archiveJob
 * @desc
 *
 */
JobsWatchdog.prototype._archiveJobs = function(){
    let _this = this;
    return new Promise(function(resolve, reject) {
        let statuses = [Constants.EAE_JOB_STATUS_COMPLETED];
        var currentTime = new Date();

        let filter = {
            status: {$in: statuses},
            statusLock: false,
            endDate: {
                '$lt': new Date(currentTime.setHours(currentTime.getHours() - global.eae_scheduler_config.jobsExpiredStatusTime))
            }
        };

        _this._mongoHelper.retrieveJobs(filter).then(function (jobs) {
            jobs.forEach(function (job) {
                let filter = {
                    _id: job._id
                };
                let fields = {
                    statusLock: true
                };
                // lock the node
                _this._mongoHelper.updateJob(filter, fields).then(
                    function (res) {
                        if(res.nModified === 1){
                            // We save the job id before archiving the job
                            let inputContainer = job._id + '_input';
                            let outputContainer = job._id + '_output';
                            // We archive the Job
                            _this._mongoHelper.archiveJob(job._id).then(function(job){
                                    // We purge the input and output files from Swift
                                    _this._deleteSwiftFilesAndContainer(inputContainer, job.input);
                                    _this._deleteSwiftFilesAndContainer(outputContainer, job.output);
                                },
                                function (error){
                                    reject(ErrorHelper('Failed to archive the job: ' + job._id, error));
                                }
                            );
                            resolve('The job has been successfully archived and files removed from swift');
                        }else{
                            resolve('The job has already been archived');
                        }},
                    function (error) {
                        reject(ErrorHelper('Failed to lock the job. Filter:' + filter.toString(), error));
                    });
            });
        },function (error){
            reject(ErrorHelper('Failed to retrieve Jobs. Filter:' + filter.toString(), error));
        });
    });
};

/**
 * @fn startPeriodicUpdate
 * @desc Start an automatic update and synchronisation of the compute status of the nodes
 * @param delay The intervals (in milliseconds) on how often to update the status
 */
JobsWatchdog.prototype.startPeriodicUpdate = function(delay = Constants.statusDefaultUpdateInterval) {
    let _this = this;

    //Stop previous interval if any
    _this.stopPeriodicUpdate();
    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){
        _this._archiveJobs(); // Purge expired jobs
    }, delay);
};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation of the compute status of the nodes
 * Does nothing if the periodic update was not running
 */
JobsWatchdog.prototype.stopPeriodicUpdate = function() {
    let _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

module.exports = JobsWatchdog;