/**
 * @fn UsersController
 * @desc Controller to manage the users service
 * @constructor
 */
function UsersController() {
    let _this = this;
    _this._jobsCollection = null;

    // Bind member functions
    _this.setCollection = _this.prototype.setCollection.bind(this);
    _this.getUser = _this.prototype.getUser.bind(this);
    _this.createUser = _this.prototype.createUser.bind(this);
    _this.deleteUser = _this.prototype.deleteUser.bind(this);
}

/**
 * @fn setCollection
 * @desc Setup the mongoDB collection to work against
 * @param jobsCollection Initialized mongodb collection to work against
 */
UsersController.prototype.setCollection = function(jobsCollection) {
    let _this = this;
    _this._jobsCollection = jobsCollection;
};

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