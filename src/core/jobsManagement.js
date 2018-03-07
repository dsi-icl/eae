// const { interface_models, interface_constants } = require('../core/models.js');
const { ErrorHelper, Constants } = require('eae-utils');
const ObjectID = require('mongodb').ObjectID;

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
 * @param jobRequest
 * @returns {Promise}
 */

JobsManagement.prototype.checkFields = function(jobRequest){
    let _this = this;

    return new Promise(function(resolve, reject) {
        // We check the core parameters
        let params = jobRequest.params;
        delete jobRequest.params;
        let coreFields = jobRequest;
        let validators = _this._algoHelper.getFieldsValidators();
        let enabledAlgorithms = _this._algoHelper.getEnabledAlgorithms();

        validators['core'].validate(coreFields).then(function() {
            if (!enabledAlgorithms.hasOwnProperty(coreFields.algorithm)) {
                reject(ErrorHelper('The selected algorithm' + coreFields.algorithm + 'is not enabled'));
                return;
            }
            validators['params'].validate(params).then(function(){
                _this._algoHelper.getListOfAlgos().then(function(authorized_algorithms) {
                    if (!authorized_algorithms.hasOwnProperty(coreFields.algorithm)) {
                        reject(ErrorHelper('The algorithm service do not contain the requested algorithm: ' + coreFields.algorithm +
                        'Please contact admin to add it.'));
                    }
                    resolve(true);
                });
            }).catch(function (error) {
                reject(ErrorHelper('Invalid params for selected algorithm.', error));
            });
        }).catch(function (error) {
            reject(ErrorHelper('Invalid core parameters.', error));
        });
    });
};

module.exports = JobsManagement;
