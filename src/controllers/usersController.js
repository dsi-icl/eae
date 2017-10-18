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

module.exports = UsersController;