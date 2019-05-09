const process = require('process');
const JobExecutorAbstract = require('./jobExecutorAbstract.js');
const {Constants} = require('eae-utils');

/**
 * @class JobExecutorPip3
 * @desc Specialization of JobExecutorAbstract for python scripts
 * @param jobID {String} The job unique identifier in DB
 * @param jobCollection MongoDB collection to sync the job model against
 * @param jobModel {Object} Plain js Job model from the mongoDB, optional if fetchModel is called
 * @constructor
 */
function JobExecutorPip3(jobID, jobCollection, jobModel) {
    JobExecutorAbstract.call(this, jobID, jobCollection, jobModel);

    // Bind member functions
    this._preExecution = JobExecutorPip3.prototype._preExecution.bind(this);
    this._postExecution = JobExecutorPip3.prototype._postExecution.bind(this);
    this.startExecution = JobExecutorPip3.prototype.startExecution.bind(this);
    this.stopExecution = JobExecutorPip3.prototype.stopExecution.bind(this);
}
JobExecutorPip3.prototype = Object.create(JobExecutorAbstract.prototype); //Inherit Js style
JobExecutorPip3.prototype.constructor = JobExecutorPip3;

/**
 * @fn _preExecution
 * @desc Prepare jobs inputs and params
 * @return {Promise} Resolve to true
 * @private
 */
JobExecutorPip3.prototype._preExecution = function() {
    // No file to transfer here, just resolve to true
    return new Promise(function (resolve, __unused__reject) {
        resolve(true);
    });
};

/**
 * @fn _postExecution
 * @desc Saves jobs outputs and clean
 * @return {Promise} Resolve to true
 * @private
 */
JobExecutorPip3.prototype._postExecution = function() {
    // No file to transfer here, just resolve to true
    return new Promise(function (resolve, __unused__reject) {
        resolve(true);
    });
};

/**
 * @fn startExecution
 * @param callback {Function} Function called after execution. callback(error, status)
 * @desc Starts the execution of designated job.
 */
JobExecutorPip3.prototype.startExecution = function(callback) {
    let _this = this;

    _this._callback = callback;
    _this.fetchModel().then(function() {
        //Clean model for execution
        _this._model.stdout = '';
        _this._model.stderr = '';
        _this._model.status.unshift(Constants.EAE_JOB_STATUS_RUNNING);
        _this._model.startDate = new Date();
        _this.pushModel().then(function() {
            let cmd = 'pip3';
            let args = _this._model.params;
            let opts = {
                cwd:  process.cwd(),
                end: process.env,
                shell: true
            };
            _this._exec(cmd, args, opts);
        }, function(error) {
            throw error;
        });
    }, function(error) {
        throw error;
    });
};

/**
 * @fn stopExecution
 * @desc Interrupts the currently executed job.
 * @param callback {Function} Function called after execution. callback(error, status)
 */
JobExecutorPip3.prototype.stopExecution = function(callback) {
    this._callback = callback;
    this._kill();
};

module.exports = JobExecutorPip3;
