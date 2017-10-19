/**
 * @fn UsersController
 * @desc Controller to manage the users service
 * @param jobsCollection
 * @constructor
 */
function UsersController(jobsCollection) {
    let _this = this;
    _this._jobsCollection = jobsCollection;

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