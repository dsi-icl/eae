const defines = require('./defines.js');
const timer = require('timers');

/**
 * @class NodesWatchdog
 * @desc Compute nodes status watchdog. Use it to track the compute status of he nodes, purge expired status and invalidate dead nodes.
 * @param config [in] Additional fields to include in the status
 * @constructor
 */
function NodesWatchdog(config = {}) {
    //Init member vars
    this._config = config;
    this._intervalTimeout = null;
    this._nodesComputeStatus = [];

    //Bind member functions
    this.startPeriodicUpdate = NodesWatchdog.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = NodesWatchdog.prototype.stopPeriodicUpdate.bind(this);
    this._update = NodesWatchdog.prototype._update.bind(this);
    this._sync = NodesWatchdog.prototype._sync.bind(this);
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
    var _this = this;


};

/**
 * @fn _sync
 * @desc Update the status in the global status collection.
 * Identification is based on the ip/port combination
 * @return {Promise} Resolve to true if update operation has been successful
 * @private
 */
NodesWatchdog.prototype._invalidateDead = function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
        if (_this._statusCollection === null || _this._statusCollection === undefined) {
            reject(defines.errorStacker('No MongoDB collection to sync against'));
            return;
        }

        var filter = { //Filter is based on ip/port combination
            ip: _this._data.ip,
            port: _this._data.port
        };
        //Updates model in base, upsert if does not exists
        _this._statusCollection.findOneAndUpdate(filter,
            { $set : _this._data },
            { upsert: true, returnOriginal: false })
            .then(function(updatedModel) {
                delete updatedModel.value._id;  //Remove ID field, let MongoDB handle ids
                _this._data = updatedModel.value;
                resolve(true);
            }, function(error) {
                reject(defines.errorStacker('Update status failed', error));
            });
    });
};

/**
 * @fn startPeriodicUpdate
 * @desc Start an automatic update and synchronisation of the compute status of the nodes
 * @param delay The intervals (in milliseconds) on how often to update the status
 */
NodesWatchdog.prototype.startPeriodicUpdate = function(delay = defines.statusDefaultUpdateInterval) {
    var _this = this;

    //Stop previous interval if any
    _this.stopPeriodicUpdate();
    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){
        _this._purgeExpired(); //Update model
        _this._invalidateDead(); //Attempt to sync in base
    }, delay);
};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation of the compute status of the nodes
 * Does nothing if the periodic update was not running
 */
NodesWatchdog.prototype.stopPeriodicUpdate = function() {
    var _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

module.exports = NodesWatchdog;