// Local modules
const { ErrorHelper, Constants } = require('eae-utils');
const JobExecutorAbstract = require('./jobExecutorAbstract.js');

/**
 * @fn QueryFile
 * @desc Query Implementation for File uploads
 * @param queryModel Plain JS Object, stored in DB
 * @param queryCollection MongoDB collection where the model is stored
 * @param storage Object storage instance to read/write query result
 * @constructor
 */
function JobExecutorPython(jobID, jobCollection) {
    JobExecutorAbstract.call(this, jobID, jobCollection);
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
JobExecutorAbstract.prototype._preExecution = function() {
    throw 'Should get inputs here';
};

/**
 * @fn _postExecution
 * @desc Saves jobs outputs and clean
 * @return {Promise} Resolve to true on successful cleanup
 * @private
 * @pure
 */
JobExecutorAbstract.prototype._postExecution = function() {
    throw 'Shoudl store outputs here';
};

/**
 * @fn startExecution
 * @desc Starts the execution of designated job.
 * @pure
 */
JobExecutorAbstract.prototype.startExecution = function() {
    throw 'Should call _exec here';
};

/**
 * @fn stopExecution
 * @desc Interrupts the currently executed job.
 * @pure
 */
JobExecutorAbstract.prototype.stopExecution = function() {
    throw 'Should call _kill here';
};

module.exports = JobExecutorPython;
