const { ErrorHelper, Constants, DataModels } = require('eae-utils');
const { interface_constants } = require('../core/models.js');
const ObjectID = require('mongodb').ObjectID;
const JobsManagement = require('../core/jobsManagement.js');

/**
 * @fn JobsController
 * @desc Controller to manage the jobs service
 * @param jobsCollection
 * @param usersCollection
 * @param accessLogger
 * @param algoHelper
 * @constructor
 */
function JobsController(jobsCollection, usersCollection, accessLogger, algoHelper) {
    let _this = this;
    _this._jobsCollection = jobsCollection;
    _this._usersCollection = usersCollection;
    _this._accessLogger = accessLogger;
    _this._jobsManagement = new JobsManagement(_this._jobsCollection, algoHelper);

    // Bind member functions
    _this.createNewJob = JobsController.prototype.createNewJob.bind(this);
    _this.getJob = JobsController.prototype.getJob.bind(this);
    _this.getAllJobs = JobsController.prototype.getAllJobs.bind(this);
    _this.cancelJob = JobsController.prototype.cancelJob.bind(this);
    _this.getJobResults = JobsController.prototype.getJobResults.bind(this);
}

/**
 * @fn postNewJob
 * @desc Create a job request. Sends back the current number of jobs pending and/or running.
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.createNewJob = function(req, res){
    let _this = this;
    let userToken = req.body.opalUserToken;

    if (userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing token'));
        return;
    }

    try {
        // Check the validity of the JOB
        let jobRequest = JSON.parse(req.body.job);
        _this._jobsManagement.checkFields(jobRequest).then(function(_unused__check) {
            let filter = {
                token: userToken
            };

            _this._usersCollection.findOne(filter).then(function (user) {
                if (user === null) {
                    res.status(401);
                    res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                    // Log unauthorized access
                    _this._accessLogger.logAccess(req);
                    return;
                }
                // Build the job to be inserted for the scheduler
                let eaeJobModel = JSON.parse(JSON.stringify(DataModels.EAE_JOB_MODEL));

                // We need to reformat the OPAL job request to feat the eAE's one
                let opalRequest = {params: jobRequest, requester: user.username};

                // We merge all those parameters to make the final job
                let newJob = Object.assign({}, eaeJobModel, opalRequest, {_id: new ObjectID(), type: Constants.EAE_JOB_TYPE_PYTHON2});
                // In opal there is no data transfer step so we move directly to queued
                newJob.status.unshift(Constants.EAE_JOB_STATUS_TRANSFERRING_DATA);
                newJob.status.unshift(Constants.EAE_JOB_STATUS_QUEUED);
                // Check users rights to execute the request
                _this._jobsManagement.authorizeRequest(user, jobRequest).then(function(_unused__accessgranted) {
                    //TODO: --EMANUELE-- request to cache if not found then schedule job
                    _this._jobsCollection.insertOne(newJob).then(function (_unused__result) {
                        _this._jobsCollection.count().then(function(count) {
                            res.status(200);
                            res.json({status: 'OK', jobID: newJob._id.toString(), jobPosition: count});
                        },function(error){
                            res.status(500);
                            res.json(ErrorHelper('Job queued but couldn\'t assert the job\'s position for computation', error));
                        });
                    },function(error){
                        res.status(500);
                        res.json(ErrorHelper('Couldn\'t insert the job for computation', error));
                    });
                }, function(error){
                    res.status(401);
                    res.json(ErrorHelper('The requested level exceeds the user\'s rights.', error));
                });
            },function(error) {
                res.status(500);
                res.json(ErrorHelper('Internal Mongo Error', error));
            });
        }, function(error){
            res.status(401);
            res.json(ErrorHelper('The field check failed.', error));
        });
    }
    catch (error) {
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

/**
 * @fn getJob
 * @desc Retrieve a specific job - Check that user requesting is owner of the job or Admin
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.getJob = function(req, res){
    let _this = this;
    let userToken = req.body.opalUserToken;
    let jobID = req.body.jobID;

    if (userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing username or token'));
        return;
    }
    try {
        _this._jobsCollection.findOne({_id: ObjectID(jobID)}).then(function(job){
            if(job === null){
                res.status(401);
                res.json(ErrorHelper('The job request do not exit. The query has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return;
            }else{
                let filter = {
                    token: userToken
                };
                _this._usersCollection.findOne(filter).then(function (user) {
                    if (user === null) {
                        res.status(401);
                        res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                        // Log unauthorized access
                        _this._accessLogger.logAccess(req);
                        return;
                    }
                    if(user.type === interface_constants.USER_TYPE.admin || job.requester === user.username){
                        res.status(200);
                        res.json(job);
                    }else{
                        res.status(401);
                        res.json(ErrorHelper('The user is not authorized to access this job.'));
                        // Log unauthorized access
                        _this._accessLogger.logAccess(req);
                    }
                }, function (_unused__error) {
                    res.status(401);
                    res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                    // Log unauthorized access
                    _this._accessLogger.logAccess(req);
                });
            }}, function(error){
            res.status(500);
            res.json(ErrorHelper('Internal Mongo Error', error));
        });
    }
    catch (error) {
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

/**
 * @fn getAllJobs
 * @desc Retrieve all current jobs (e.g. all jobs which have not been archived) - Admin only
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.getAllJobs = function(req, res){
    let _this = this;
    let userToken = req.body.opalUserToken;

    if (userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing username or token'));
        return;
    }
    try {
        let filter = {
            token: userToken
        };

        _this._usersCollection.findOne(filter).then(function (user) {
            if (user === null) {
                res.status(401);
                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return;
            }
            if(user.type === interface_constants.USER_TYPE.admin){
                _this._jobsCollection.find({}).toArray().then(function(allJobs) {
                    res.status(200);
                    res.json(allJobs);
                },function(error){
                    res.status(500);
                    res.json(ErrorHelper('Internal Mongo Error', error));
                });
            }else{
                res.status(401);
                res.json(ErrorHelper('The user is not authorized to access this job.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
            }
        }, function (_unused__error) {
            res.status(401);
            res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
            // Log unauthorized access
            _this._accessLogger.logAccess(req);
        });

    }
    catch (error) {
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

/**
 * @fn cancelJob
 * @desc Cancels a job. Check that user requesting is owner of the job or Admin
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.cancelJob = function(req, res) {
    let _this = this;
    let userToken = req.body.opalUserToken;
    let jobID = req.body.jobID;


    if (userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing username or token'));
        return;
    }
    try{
        _this._jobsCollection.findOne({_id: ObjectID(jobID)}).then(function(job) {
                if (job === null) {
                    res.status(401);
                    res.json(ErrorHelper('The job request do not exists. The query has been logged.'));
                    // Log unauthorized access
                    _this._accessLogger.logAccess(req);
                    return;
                } else {
                    if(job.status[0] === Constants.EAE_JOB_STATUS_TRANSFERRING_DATA ||
                        job.status[0] === Constants.EAE_JOB_STATUS_QUEUED ||
                        job.status[0] === Constants.EAE_JOB_STATUS_SCHEDULED ||
                        job.status[0] === Constants.EAE_JOB_STATUS_RUNNING ||
                        job.status[0] === Constants.EAE_JOB_STATUS_ERROR
                    ){
                        let filter = {
                            token: userToken
                        };
                        _this._usersCollection.findOne(filter).then(function (user) {
                            if (user === null) {
                                res.status(401);
                                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                                // Log unauthorized access
                                _this._accessLogger.logAccess(req);
                                return;
                            }
                            if (user.type === interface_constants.USER_TYPE.admin || job.requester === user.username) {
                                _this._jobsManagement.cancelJob(job).then(function(resCancelledJob){
                                    res.status(200);
                                    res.json(Object.assign({}, {status: 'Job ' + jobID + ' has been successfully cancelled.'}, resCancelledJob));
                                },function(error){
                                    res.status(500);
                                    res.json(ErrorHelper('Internal server error', error));
                                });
                            }else{
                                res.status(401);
                                res.json(ErrorHelper('The user is not authorized to access this job.'));
                                // Log unauthorized access
                                _this._accessLogger.logAccess(req);
                            }
                        }, function (_unused__error) {
                            res.status(401);
                            res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                            // Log unauthorized access
                            _this._accessLogger.logAccess(req);
                        });
                    }else{
                        res.status(412);
                        res.json(ErrorHelper('The job requested cannot be cancelled because he is not pending, queued, ' +
                            'running or in error. Current status: ' + job.status[0]));
                    }
                }}
            , function(error){
                res.status(500);
                res.json(ErrorHelper('Internal Mongo Error', error));
            });
    }
    catch (error) {
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

/**
 * @fn getJobResults
 * @desc Retrieve the results for a specific job.
 * Check that user requesting is owner of the job or Admin
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.getJobResults = function(req, res){
    let _this = this;
    let userToken = req.body.opalUserToken;
    let jobID = req.body.jobID;

    if (userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing username or token'));
        return;
    }
    try{
        _this._jobsCollection.findOne({_id: ObjectID(jobID)}).then(function(job){
            if(job === null){
                res.status(401);
                res.json(ErrorHelper('The job request do not exit. The query has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return;
            }else{
                if(job.status[0] === Constants.EAE_JOB_STATUS_COMPLETED){
                    let filter = {
                        token: userToken
                    };
                    _this._usersCollection.findOne(filter).then(function (user) {
                        if (user === null) {
                            res.status(401);
                            res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                            // Log unauthorized access
                            _this._accessLogger.logAccess(req);
                            return;
                        }
                        if(user.type === interface_constants.USER_TYPE.admin || job.requester === user.username){
                                //TODO: replace create manifest by sending back the results
                                res.status(200);
                                res.json({status: 'OK'});
                        }else{
                            res.status(401);
                            res.json(ErrorHelper('The user is not authorized to access this job.'));
                            // Log unauthorized access
                            _this._accessLogger.logAccess(req);
                        }
                    }, function (_unused__error) {
                        res.status(401);
                        res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                        // Log unauthorized access
                        _this._accessLogger.logAccess(req);
                    });
                }else{
                    res.status(412);
                    res.json(ErrorHelper('The job requested is not ready for collection. Current status: ' + job.status[0]));
                }
            }}
                , function(error){
                res.status(500);
                res.json(ErrorHelper('Internal Mongo Error', error));
            });

    }
    catch (error) {
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

module.exports = JobsController;
