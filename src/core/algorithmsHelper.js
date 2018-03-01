const timer = require('timers');

/**
* @fn AlgorithmHelper
* @desc Algorithms manager. Use it to update the available algorithms in OPAL
* @param config [in] Additional fields to include in the status
* @constructor
*/
function AlgorithmHelper(config = {}) {
    //Init member vars
    this._config = config;
    this._intervalTimeout = null;

    //Bind member functions
    this.startPeriodicUpdate = AlgorithmHelper.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = AlgorithmHelper.prototype.stopPeriodicUpdate.bind(this);
    this._sync = AlgorithmHelper.prototype._sync.bind(this);
}
/**
 * @fn _sync
 * @desc Update the status in the global status collection.
 * Identification is based on the ip/port combination
 * @return {Promise} Resolve to true if update operation has been successful
 * @private
 */
AlgorithmHelper.prototype._sync = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        if (_this._statusCollection === null || _this._statusCollection === undefined) {
            reject(defines.errorStacker('No MongoDB collection to sync against'));
            return;
        }

        let filter = { //Filter is based on ip/port combination
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
 * @desc Start an automatic update and synchronisation of the status
 * @param delay The intervals (in milliseconds) on how often to update the status
 */
AlgorithmHelper.prototype.startPeriodicUpdate = function(delay = 100000) {
    let _this = this;

    //Stop previous interval if any
    _this.stopPeriodicUpdate();
    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){
        _this._sync(); //Update the list
    }, delay);
};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation.
 * Does nothing if the periodic update was not running
 */
AlgorithmHelper.prototype.stopPeriodicUpdate = function() {
    let _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

/**
 * @fn AlgorithmHelperExport
 * @param algoServiceURL {String} A valid connection url to the OPAL-algoService
 * @param options {Object} Additional custom fields
 * @return {AlgorithmHelperExport} Helper class
 */
function AlgorithmHelperExport(algoServiceURL = 'algoService', options = {}) {
    let opts = Object.assign({}, algoServiceURL, options);
    return new AlgorithmHelper(opts);
}
module.exports = AlgorithmHelperExport;
