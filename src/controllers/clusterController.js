/**
 * @fn ClusterController
 * @desc Controller to manage the cluster service
 * @constructor
 */
function ClusterController() {
    let _this = this;
    _this._statusCollection = null;

    // Bind member functions
    _this.setCollection = _this.prototype.setCollection.bind(this);
}

/**
 * @fn setCollection
 * @desc Setup the mongoDB collection to work against
 * @param statusCollection Initialized mongodb collection to work against
 */
ClusterController.prototype.setCollection = function(statusCollection) {
    let _this = this;
    _this._statusCollection = statusCollection;
};

module.exports = ClusterController;