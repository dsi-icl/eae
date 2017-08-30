const timer = require('timers');
const { ErrorHelper, Constants } =  require('eae-utils');

/**
 * @class NodesWatchdog
 * @desc Compute nodes status watchdog. Use it to track the compute status of he nodes, purge expired status and invalidate dead nodes.
 * @param mongoHelper Helper class to interact with Mongo
 * @constructor
 */
function NodesWatchdog(mongoHelper) {
    //Init member vars
    this._intervalTimeout = null;
    this._nodesComputeStatus = [];
    this._mongoHelper = mongoHelper;

    //Bind member functions
    this.startPeriodicUpdate = NodesWatchdog.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = NodesWatchdog.prototype.stopPeriodicUpdate.bind(this);

    // Action Methods
    this._notifyAdmin = NodesWatchdog.prototype._notifyAdmin.bind(this);
    this._excludeNodes = NodesWatchdog.prototype._excludeNodes.bind(this);
    this._invalidateDead = NodesWatchdog.prototype._invalidateDead.bind(this);
    this._purgeExpired = NodesWatchdog.prototype._purgeExpired.bind(this);
}

/**
 * @fn _notifyAdmin
 * @desc Sends a mail to the Administrator with the nodes which are in DEAD status
 * @param {JSON} deadNode
 * @private
 */
NodesWatchdog.prototype._notifyAdmin = function(deadNode){
    // For now it just prints to the console but in the future we want it to send a mail. #TODO
    console.log('The node with IP ' + deadNode.ip + ' and port ' + deadNode.port);
};

/**
 * @fn _excludeNodes
 * @desc Set the status of the dead nodes to excluded
 * @param {Array} deadNodes List of dead nodes
 * @private
 */
NodesWatchdog.prototype._excludeNodes = function(deadNodes){
    let _this = this;

    return new Promise(function(resolve, reject) {
        deadNodes.forEach(function (node) {
            let filter = { //Filter is based on ip/port combination
                ip: node.ip,
                port: node.port
            };

            let fields = {
                statusLock: true
            };
            _this._mongoHelper.updateNodeStatus(filter, fields).then(function (success) {
                _this._notifyAdmin(node);
                resolve(success);
            }, function (error) {
                reject(ErrorHelper('Failed to update the nodes status to dead. Filter:' + filter.toString(), error));
            });
        });
    });
};

/**
 * @fn _purgeExpired
 * @desc Remove all Nodes that have been Busy or Reserved for longer than a defined threshold
 * @private
 */
NodesWatchdog.prototype._purgeExpired = function() {
    let _this = this;
    let statuses = [Constants.EAE_SERVICE_STATUS_BUSY, Constants.EAE_SERVICE_STATUS_LOCKED];
    var currentTime = new Date();

    let filter = {
        status: {$in: statuses},
        statusLock: false,
        lastUpdate: {
            '$gte': new Date(0),
            '$lt': new Date(currentTime.setHours(currentTime.getHours() - global.eae_scheduler_config.expiredStatusTime))
        }
    };

    _this._nodesComputeStatus = _this._mongoHelper.retrieveNodesStatus(filter).then(function (nodes) {
        nodes.forEach(function (node) {
            let filter = { //Filter is based on ip/port combination
                ip: node.ip,
                port: node.port
            };
            let fields = {
                status: Constants.EAE_SERVICE_STATUS_DEAD,
                statusLock: true
            };
            // lock the node
            _this._mongoHelper.updateNodeStatus(filter, fields).then(
                function (success) {
                    if(success.nModified === 1){
                        console.log('The expired node' + node.ip + ':' + node.port + 'has been set to DEAD successfully');
                    }else{
                        console.log('The node has already been updated ' + node.ip + ':' + node.port);
                    }},
                function (error) {
                    ErrorHelper('Failed to lock the node and set its status to DEAD. Filter:' + filter.toString(), error);
                });
        });
    },function (error){
        console.log('Failed to retrieve nodes status. Filter:' + filter.toString(), error);
    });
};

/**
 * @fn _invalidateDead
 * @desc Remove nodes whose status is Dead from available resources
 * @return
 * @private
 */
NodesWatchdog.prototype._invalidateDead = function() {
    let _this = this;
    let statuses = [Constants.EAE_SERVICE_STATUS_DEAD];

    let filter = {
        status: {$in: statuses},
        statusLock: false
    };

    _this._nodesComputeStatus = _this._mongoHelper.retrieveNodesStatus(filter).then(function (deadNodes) {
        if(deadNodes.length > 0){
            _this._excludeNodes(deadNodes);
        }
    }, function(error) {
        console.log('Failed to retrieve nodes status. Filter:' + filter.toString() , error);
    });
};

/**
 * @fn startPeriodicUpdate
 * @desc Start an automatic update and synchronisation of the compute status of the nodes
 * @param delay The intervals (in milliseconds) on how often to update the status
 */
NodesWatchdog.prototype.startPeriodicUpdate = function(delay = Constants.statusDefaultUpdateInterval) {
    let _this = this;

    //Stop previous interval if any
    _this.stopPeriodicUpdate();
    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){
        _this._purgeExpired(); // Purge expired jobs
        _this._invalidateDead(); // Purge dead nodes
    }, delay);
};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation of the compute status of the nodes
 * Does nothing if the periodic update was not running
 */
NodesWatchdog.prototype.stopPeriodicUpdate = function() {
    let _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

module.exports = NodesWatchdog;