const process = require('process');
const JobExecutorAbstract = require('./jobExecutorAbstract.js');

/**
 * @class JobExecutorPip
 * @desc Specialization of JobExecutorAbstract for python scripts
 * @param jobID {String} The job unique identifier in DB
 * @param jobCollection MongoDB collection to sync the job model against
 * @constructor
 */
function JobExecutorPip(jobID, jobCollection) {
    JobExecutorAbstract.call(this, jobID, jobCollection);

    // Bind member functions
    this._preExecution = JobExecutorPip.prototype._preExecution.bind(this);
    this._postExecution = JobExecutorPip.prototype._postExecution.bind(this);
    this.startExecution = JobExecutorPip.prototype.startExecution.bind(this);
    this.stopExecution = JobExecutorPip.prototype.stopExecution.bind(this);
}
JobExecutorPip.prototype = Object.create(JobExecutorAbstract.prototype); //Inherit Js style
JobExecutorPip.prototype.constructor = JobExecutorPip;

/**
 * @fn _preExecution
 * @desc Prepare jobs inputs and params
 * @return {Promise} Resolve to true
 * @private
 */
JobExecutorPip.prototype._preExecution = function() {
    // No file to transfer here, just resolve to true
    return new Promise(function (resolve, _unused__reject) {
        resolve(true);
    });
};

/**
 * @fn _postExecution
 * @desc Saves jobs outputs and clean
 * @return {Promise} Resolve to true
 * @private
 */
JobExecutorPip.prototype._postExecution = function() {
    // No file to transfer here, just resolve to true
    return new Promise(function (resolve, _unused__reject) {
        resolve(true);
    });
};

/**
 * @fn startExecution
 * @param callback {Function} Function called after execution. callback(error, status)
 * @desc Starts the execution of designated job.
 */
JobExecutorPip.prototype.startExecution = function(callback) {
    var _this = this;

    _this._callback = callback;
    _this.fetchModel().then(function() {
        var cmd = 'pip';
        var args = _this._model.params;
        var opts = {
            cwd:  process.cwd(),
            end: process.env,
            shell: true
        };
        _this._exec(cmd, args, opts);
    }, function(error) {
        throw error;
    });
};

/**
 * @fn stopExecution
 * @desc Interrupts the currently executed job.
 * @param callback {Function} Function called after execution. callback(error, status)
 */
JobExecutorPip.prototype.stopExecution = function(callback) {
    this._callback = callback;
    this._kill();
};

module.exports = JobExecutorPip;
