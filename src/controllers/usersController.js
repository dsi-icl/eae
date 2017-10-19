/**
 * @fn UsersController
 * @desc Controller to manage the users service
 * @param jobsCollection
 * @param accessLogger
 * @constructor
 */
function UsersController(jobsCollection, accessLogger) {
    let _this = this;
    _this._jobsCollection = jobsCollection;
    _this.accessLogger = accessLogger;

    // Bind member functions
    _this.getUser = UsersController.prototype.getUser.bind(this);
    _this.createUser = UsersController.prototype.createUser.bind(this);
    _this.deleteUser = UsersController.prototype.deleteUser.bind(this);
}


/**
 * @fn getUser
 * @desc Sends back the profile of the requested user
 * @param req
 * @param res
 */
UsersController.prototype.getUser = function(req, res){
    let _this = this;
    let userId = req.params.user_id;
    let
};

/**
 * @fn createUser
 * @desc Create a new user to get access to the platform
 * @param req
 * @param res
 */
UsersController.prototype.createUser = function(req, res){

};

/**
 * @fn deleteUser
 * @desc Delete an existing user to remove access to the platform
 * @param req
 * @param res
 */
UsersController.prototype.deleteUser = function(req, res){

};

module.exports = UsersController;