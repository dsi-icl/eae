const { Constants } = require('../core/models.js');
const Cluster = require('../core.cluster.js');

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
    let userId = req.params.userId;
    let userToken = req.params.userToken;

    if (userId === null || userId === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing user_id or token'));
        return;
    }

    _this._statusCollection.findOne(filter).then(function (user) {
            if(user.type === Constants.USER_TYPE.admin){
                let cluster = new Cluster(_this._statusCollection);
                let clusterStatus = cluster.getStatuses();
                res.status(200);
                res.json(clusterStatus);
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

};

module.exports = ClusterController;