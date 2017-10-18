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

/**
 * @fn getServicesStatus
 * @desc Checks that the request is coming from an Admin and sends back the statuses of all the services in the cluster.
 * @param req
 * @param res
 */
ClusterController.prototype.getServicesStatus = function(req, res){

};

module.exports = ClusterController;