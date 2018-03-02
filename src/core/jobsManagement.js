// const { interface_models, interface_constants } = require('../core/models.js');
const { ErrorHelper, Constants } = require('eae-utils');
const ObjectID = require('mongodb').ObjectID;
const check = require('check-types');

/**
 * @fn Utils
 * @desc Manages the job from the Created status to the Queued status (from which the scheduler takes over)
 * @param jobsCollection
 * @param algorithmHelper
 * @constructor
 */
function JobsManagement(jobsCollection, algorithmHelper) {
    let _this = this;
    _this._jobsCollection = jobsCollection;
    _this._algoHelper = algorithmHelper;

    // Bind member functions
    _this.cancelJob = JobsManagement.prototype.cancelJob.bind(this);
    _this.checkFields = JobsManagement.prototype.checkFields.bind(this);
}


/**
 * @fn cancelJob
 * @desc Sets the status of a job to cancelled. It then gets picked up by the scheduler for processing.
 * @param job
 * @returns {Promise}
 */
JobsManagement.prototype.cancelJob = function(job){
    let _this = this;

    return new Promise(function(resolve, reject) {
        job.status.unshift(Constants.EAE_JOB_STATUS_CANCELLED);
        _this._jobsCollection.findOneAndUpdate({_id: ObjectID(job._id)},
            {$set: job},
            {returnOriginal: false, w: 'majority', j: false})
            .then(function (res) {
                resolve({res: res, cancelledJob: job});
            }, function (error) {
                reject(ErrorHelper('Could not cancel the job.', error));
            });
    });
};

/**
 * @fn checkFields
 * @desc Checks that all mandatory fields and params are valid for the specified algorithm.
 * @param jobParameters
 * @returns {Promise}
 */

JobsManagement.prototype.checkFields = function(jobParameters){
    let _this = this;

    return new Promise(function(resolve, reject) {
        // We check

        // We check the core parameters



        resolve(true);
    });
};

module.exports = JobsManagement;
