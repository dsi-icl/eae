const { ErrorHelper, DataModels } = require('eae-utils');
const { interface_constants } = require('../core/models.js');
const ObjectID = require('mongodb').ObjectID;
const JobsManagement = require('../core/jobsManagement.js');

/**
 * @fn JobsController
 * @desc Controller to manage the jobs service
 * @param jobsCollection
 * @param accessLogger
 * @constructor
 */
function JobsController(jobsCollection, accessLogger) {
    let _this = this;
    _this._jobsCollection = jobsCollection;
    _this.accessLogger = accessLogger;

    // Bind member functions
    _this.createNewJob = JobsController.prototype.createNewJob.bind(this);
    _this.getJob = JobsController.prototype.getJob.bind(this);
    _this.getAllJobs = JobsController.prototype.getAllJobs.bind(this);
    _this.getJobResults = JobsController.prototype.getJobResults.bind(this);
}

/**
 * @fn postNewJob
 * @desc Create a job request. Sends back the list of carriers available for uploading the data.
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.createNewJob = function(req, res){
    let _this = this;
    let eaeUsername = req.body.eaeUsername;
    let userToken = req.body.eaeUserToken;

    if (eaeUsername === null || eaeUsername === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing username or token'));
        return;
    }
    try {
        // Check the validity of the JOB
        let jobRequest = req.body.job;
        let requiredJobFields = ['type', 'main', 'params', 'input'];
        requiredJobFields.forEach(function(key){
            if(jobRequest[key] === null || jobRequest[key] === undefined){
                res.status(401);
                res.json(ErrorHelper('Job request is not well formed. Missing ' + jobRequest[key]));
                return;
            }
        });

        let newJob = Object.assign(DataModels.EAE_JOB_MODEL, jobRequest);
        let filter = {
            username: eaeUsername,
            token: userToken
        };

        _this._usersCollections.findOne(filter).then(function (user) {
            if (user === null) {
                res.status(401);
                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return;
            }
            _this._jobsCollection.insertOne(newJob).then(function (inserted) {
                let jobsManagement = new JobsManagement();
                // This will monitor the data transfer status
                jobsManagement.startJobMonitoring(inserted._id);

                // We create a manifest for the carriers to work against
                jobsManagement.createJobManifestForCarriers(newJob.input).then(function(){
                    res.status(200);
                    res.json(inserted);
                },function(error){
                    res.status(500);
                    res.json(ErrorHelper('Couldn\'t create the manifest for the carriers to transfer the files', error));
                });
            },function(error) {
                res.status(500);
                res.json(ErrorHelper('Internal Mongo Error', error));
            });
        },function(error){
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
 * @fn getJob
 * @desc Retrieve a specific job - Check that user requesting is owner of the job or Admin
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.getJob = function(req, res){
    let _this = this;
    let eaeUsername = req.body.eaeUsername;
    let userToken = req.body.eaeUserToken;
    let jobID = req.body.jobID;

    if (eaeUsername === null || eaeUsername === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing user_id or token'));
        return;
    }
    try {
        let filter = {
            username: eaeUsername,
            token: userToken
        };

        _this._jobsCollection.findOne({_id: ObjectID(jobID)}).then(function(job){
            if(job === null){
                res.status(401);
                res.json(ErrorHelper('The job request do not exit. The query has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return;
            }else{
                _this._usersCollections.findOne(filter).then(function (user) {
                    if (user === null) {
                        res.status(401);
                        res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                        // Log unauthorized access
                        _this._accessLogger.logAccess(req);
                        return;
                    }
                    if(user.type === interface_constants.USER_TYPE.admin || job.requestor === user.username){
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
            }}
        );
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
    let eaeUsername = req.body.eaeUsername;
    let userToken = req.body.eaeUserToken;


    if (eaeUsername === null || eaeUsername === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing user_id or token'));
        return;
    }
    try {
        let filter = {
            username: eaeUsername,
            token: userToken
        };

        _this._usersCollections.findOne(filter).then(function (user) {
            if (user === null) {
                res.status(401);
                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return;
            }
            if(user.type === interface_constants.USER_TYPE.admin ){
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
 * @fn getJobResults
 * @desc Retrieve the results for a specific job by sending back the carriers where they are available.
 * Check that user requesting is owner of the job or Admin
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.getJobResults = function(req, res){
    let _this = this;
};

module.exports = JobsController;