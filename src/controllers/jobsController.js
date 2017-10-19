/**
 * @fn JobsController
 * @desc Controller to manage the jobs service
 * @param jobsCollection
 * @constructor
 */
function JobsController(jobsCollection) {
    let _this = this;
    _this._jobsCollection = jobsCollection;

    // Bind member functions
    _this.postNewJob = JobsController.prototype.postNewJob.bind(this);
    _this.getJob = JobsController.prototype.getJob.bind(this);
    _this.getAllJobs = JobsController.prototype.getAllJobs.bind(this);
    _this.getJobResults = JobsController.prototype.getJobResults.bind(this);
}

/**
 * @fn postNewJob
 * @desc Create a job request. Sends back the list of carriers available for uploading the data.
 * @param req
 * @param res
 */
JobsController.prototype.postNewJob = function(req, res){
    let _this = this;
};

/**
 * @fn getJob
 * @desc Retrieve a specific job - Check that user requesting is owner of the job or Admin
 * @param req
 * @param res
 */
JobsController.prototype.getJob = function(req, res){
    let _this = this;
};

/**
 * @fn getAllJobs
 * @desc Retrieve all current jobs (e.g. all jobs which have not been archived) - Admin only
 * @param req
 * @param res
 */
JobsController.prototype.getAllJobs = function(req, res){
    let _this = this;
};

/**
 * @fn getJobResults
 * @desc Retrieve the results for a specific job by sending back the carriers where they are available.
 * Check that user requesting is owner of the job or Admin
 * @param req
 * @param res
 */
JobsController.prototype.getJobResults = function(req, res){
    let _this = this;
};

module.exports = JobsController;