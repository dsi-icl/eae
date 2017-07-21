const process = require('process');
const JobExecutorAbstract = require('./jobExecutorAbstract.js');

/**
 * @class JobExecutorPython
 * @desc Specialization of JobExecutorAbstract for python scripts
 * @param jobID {String} The job unique identifier in DB
 * @param jobCollection MongoDB collection to sync the job model against
 * @constructor
 */
function JobExecutorPython(jobID, jobCollection) {
    JobExecutorAbstract.call(this, jobID, jobCollection);

    // Bind member functions
    this._preExecution = JobExecutorPython.prototype._preExecution.bind(this);
    this._postExecution = JobExecutorPython.prototype._postExecution.bind(this);
    this.startExecution = JobExecutorPython.prototype.startExecution.bind(this);
    this.stopExecution = JobExecutorPython.prototype.stopExecution.bind(this);

}
JobExecutorPython.prototype = Object.create(JobExecutorAbstract.prototype); //Inherit Js style
JobExecutorPython.prototype.constructor = JobExecutorPython;

/**
 * @fn _preExecution
 * @desc Prepare jobs inputs and params
 * @return {Promise} Resolve to true on successful preparation
 * @private
 * @pure
 */
JobExecutorPython.prototype._preExecution = function() {
    // throw 'Should get inputs here';
    return new Promise(function (resolve, _unused__reject) {
        resolve(true);
    });
};

/**
 * @fn _postExecution
 * @desc Saves jobs outputs and clean
 * @return {Promise} Resolve to true on successful cleanup
 * @private
 * @pure
 */
JobExecutorPython.prototype._postExecution = function() {
    // throw 'Should store outputs here';
    return new Promise(function (resolve, _unused__reject) {
        resolve(true);
    });
};

/**
 * @fn startExecution
 * @param callback {Function} Function called after execution. callback(error, status)
 * @desc Starts the execution of designated job.
 */
JobExecutorPython.prototype.startExecution = function(callback) {
    var _this = this;

    _this._callback = callback;
    _this.fetchModel().then(function() {
        var cmd = 'python ' + _this._model.main;
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
    // throw 'Should call _exec here';
};

/**
 * @fn stopExecution
 * @desc Interrupts the currently executed job.
 * @param callback {Function} Function called after execution. callback(error, status)
 */
JobExecutorPython.prototype.stopExecution = function(callback) {
    this._callback = callback;
    this._kill();
    // throw 'Should call _kill here';
};

module.exports = JobExecutorPython;
