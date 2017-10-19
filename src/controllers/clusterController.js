const { Constants, ErrorHelper } = require('../core/models.js');
const Cluster = require('../core/cluster.js');

/**
 * @fn ClusterController
 * @desc Controller to manage the cluster service
 * @param statusCollection
 * @constructor
 */
function ClusterController(statusCollection) {
    let _this = this;
    _this._statusCollection = statusCollection;

    // Bind member functions
    _this.getServicesStatus = ClusterController.prototype.getServicesStatus.bind(this);
}

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
    try {
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
    }
    catch (error) { // ObjectID creation might throw
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

module.exports = ClusterController;