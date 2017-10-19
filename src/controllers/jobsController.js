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
    let userId = req.query.userId;
    let userToken = req.query.userToken;

    if (userId === null || userId === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing user_id or token'));
        return;
    }
    try {
        let filter = {
            username: userId,
            token: userToken
        };
        _this._usersCollections.findOne(filter).then(function (user) {
                if(user.type === interface_constants.USER_TYPE.admin){
                    let cluster = new Cluster(_this._statusCollection);
                    cluster.getStatuses().then(function(clusterStatuses) {
                        res.status(200);
                        res.json(clusterStatuses);
                    },function(error){
                        res.status(500);
                        res.json(ErrorHelper('Internal Mongo Error', error))
                    });
                }else{
                    res.status(401);
                    res.json(ErrorHelper('The user is not authorized to access this command'));
                }
            }, function (__unused_error) {
                res.status(401);
                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                // Add unauthorized access
            }
        );
    }
    catch (error) { // ObjectID creation might throw
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
};

/**
 * @fn getAllJobs
 * @desc Retrieve all current jobs (e.g. all jobs which have not been archived) - Admin only
 * @param req Incoming message
 * @param res Server Response
 */
JobsController.prototype.getAllJobs = function(req, res){
    let _this = this;
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