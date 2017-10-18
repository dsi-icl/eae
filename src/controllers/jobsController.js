/**
 * @fn JobsController
 * @desc Controller to manage the jobs service
 * @constructor
 */
function JobsController() {
    let _this = this;
    _this._jobsCollection = null;

    // Bind member functions
    _this.setCollection = _this.prototype.setCollection.bind(this);
}

/**
 * @fn setCollection
 * @desc Setup the mongoDB collection to work against
 * @param jobsCollection Initialized mongodb collection to work against
 */
JobsController.prototype.setCollection = function(jobsCollection) {
    let _this = this;
    _this._jobsCollection = jobsCollection;
};

/**
 * @fn postNewJob
 * @desc Create a job request. Sends back the list of carriers available for uploading the data.
 * @param req
 * @param res
 */
JobsController.prototype.postNewJob = function(req, res){

};

/**
 * @fn getJob
 * @desc Retrieve a specific job - Check that user requesting is owner of the job or Admin
 * @param req
 * @param res
 */
JobsController.prototype.getJob = function(req, res){

};

/**
 * @fn getAllJobs
 * @desc Retrieve all current jobs (e.g. all jobs which have not been archived) - Admin only
 * @param req
 * @param res
 */
JobsController.prototype.getAllJobs = function(req, res){

};

/**
 * @fn getJobResults
 * @desc Retrieve the results for a specific job by sending back the carriers where they are available.
 * Check that user requesting is owner of the job or Admin
 * @param req
 * @param res
 */
JobsController.prototype.getJobResults = function(req, res){

};

module.exports = JobsController;