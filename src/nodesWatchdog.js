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
 * @fn _update
 * @desc
 * @private
 */
NodesWatchdog.prototype._purgeExpired = function() {
    let _this = this;
    let statuses = [Constants.EAE_SERVICE_STATUS_BUSY, Constants.EAE_SERVICE_STATUS_LOCKED];

    _this._nodesComputeStatus = _this._mongoHelper.retrieveNodesWithStatus(statuses);



};

/**
 * @fn _sync
 * @desc Update the status in the global status collection.
 * Identification is based on the ip/port combination
 * @return {Promise} Resolve to true if update operation has been successful
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