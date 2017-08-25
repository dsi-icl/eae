const timer = require('timers');
const { Constants } =  require('eae-utils');

/**
 * @class NodesWatchdog
 * @desc Compute nodes status watchdog. Use it to track the compute status of he nodes, purge expired status and invalidate dead nodes.
 * @param mongoHelper Hlper class to interact with Mongo
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
    this._invalidateDead = NodesWatchdog.prototype._invalidateDead.bind(this);
    this._purgeExpired = NodesWatchdog.prototype._purgeExpired.bind(this);
}

/**
 * @fn
 *
 */

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
        lastUpdate : {'$gte': new Date(0), '$lt': new Date(currentTime.setHours(currentTime.getHours() - global.eae_scheduler_config.expiredStatusTime))}
    };

    // let projection = {
    //     ip : 1,
    //     port : 1
    //     status : 1
    // };

    _this._nodesComputeStatus = _this._mongoHelper.retrieveNodesStatus(filter).then(function (docs) {
        console.log(docs.toString());
    }, function(error) {
        console.log('Failed to retrieve nodes status. Filter:' + filter.toString() , error);
    });
};

/**
 * @fn _invalidateDead
 * @desc Remove nodes whose status is Dead from available resources
 * @return
 * @private
 */
NodesWatchdog.prototype._invalidateDead = function() {
    // let _this = this;
    // let statuses = [Constants.EAE_SERVICE_STATUS_DEAD];
    //
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