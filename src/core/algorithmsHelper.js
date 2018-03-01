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
    this.getDataModel = AlgorithmHelper.prototype.getDataModel.bind(this);
    this.startPeriodicUpdate = AlgorithmHelper.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = AlgorithmHelper.prototype.stopPeriodicUpdate.bind(this);
    this._update = AlgorithmHelper.prototype._update.bind(this);
    this._sync = AlgorithmHelper.prototype._sync.bind(this);
}

module.exports = AlgorithmHelper;
