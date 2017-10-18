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

module.exports = JobsController;