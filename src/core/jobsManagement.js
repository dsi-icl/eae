const timer = require('timers');
const { interface_models } = require('../core/models.js');
const { ErrorHelper, Constants } = require('eae-utils');
const ObjectID = require('mongodb').ObjectID;

/**
 * @fn Utils
 * @desc Manages the job from the Created status to the Queued status (from which the scheduler takes over)
 * @constructor
 */
function JobsManagement(carrierCollection, jobsCollection, delay = Constants.STATUS_DEFAULT_UPDATE_INTERVAL, maximumTimeForFileTransfer = 1000 * 3600 * 12) {
    let _this = this;
    _this._carrierCollection = carrierCollection;
    _this._jobsCollection = jobsCollection;
    _this._timers = {};
    _this._delay = delay;
    _this._maximumTimeForFileTransfer = maximumTimeForFileTransfer;

    // Bind member functions
    _this.createJobManifestForCarriers = JobsManagement.prototype.createJobManifestForCarriers.bind(this);
    _this.startJobMonitoring = JobsManagement.prototype.startJobMonitoring.bind(this);

}

/**
 * @fn createJobManifestForCarriers
 * @desc Creates a manifest for the carriers to know which files to expect.
 * @param newJob eae job containing the username of the requester and the filesArray
 * @param jobID id of the job
 */
JobsManagement.prototype.createJobManifestForCarriers = function(newJob, jobID){
    let _this = this;

    return new Promise(function(resolve, reject) {
        // We build the carrier job
        let carrierJob = Object.assign(interface_models.CARRIER_JOB_MODEL,
            { files: newJob.input, requester: newJob.requester,
                jobId: jobID ,numberOfFilesToTransfer:  newJob.input.length});
        delete carrierJob._id;
        // We insert it for the carriers to work against
        _this._carrierCollection.insertOne(carrierJob).then(function (_unused__result) {
            newJob.status.unshift(Constants.EAE_JOB_STATUS_TRANSFERRING_DATA) ;
            _this._jobsCollection.findOneAndUpdate({_id: ObjectID(jobID)},
                                                   { $set: newJob},
                                                   { returnOriginal: false, w: 'majority', j: false })
                .then(function (res) {
                    resolve(res);
            }, function (error){
                reject(ErrorHelper('Could not insert a new carrier job for the file transfer',error));
            })
        }, function (error) {
            reject(ErrorHelper('Could not insert a new carrier job for the file transfer',error));
        });
    });
};

/**
 * @fn jobMonitoring
 * @desc Monitors the progress of the file transfer. When the file transfer is completed, it changes the status of the
 * job from data transfer to Queued.
 * @param newJob
 * @param jobID
 */
JobsManagement.prototype.startJobMonitoring =  function(newJob, jobID) {
    let _this = this;

    return new Promise(function(resolve, reject) {
        //Start a new interval update
        _this._timers[jobID] = timer.setInterval(function () {
            // let currentJob = jobID;
            _this._carrierCollection.findOne({jobId : jobID}).then(function(carrierJob){
                // We check if the file transfer is completed
                if(carrierJob.numberOfTransferredFiles === carrierJob.numberOfFilesToTransfer){
                    if (_this._timers[jobID] !== null && _this._timers[jobID] !== undefined) {
                        // We stop the timer
                        timer.clearInterval(_this._timers[jobID]);
                        _this._timers[jobID] = null;
                        // The job is ready for scheduling, we set the status of the job to QUEUED
                        newJob.status.unshift(Constants.EAE_JOB_STATUS_QUEUED) ;
                        _this._jobsCollection.findOneAndUpdate({_id: ObjectID(jobID)},
                            { $set: newJob},
                            { returnOriginal: false, w: 'majority', j: false }).then(function (res) {
                            _this._carrierCollection.deleteOne({jobId : jobID});
                            resolve(res);
                        },function(error){
                            reject(ErrorHelper('Internal Mongo Error', error));
                        });
                    }}
                // We check if the file transfer has timed out
                let currentTime = new Date().getTime();
                let timeElapsed = currentTime - carrierJob.created.getTime();
                if(timeElapsed > _this._maximumTimeForFileTransfer){
                    if (_this._timers[jobID] !== null && _this._timers[jobID] !== undefined) {
                        // We stop the timer
                        timer.clearInterval(_this._timers[jobID]);
                        _this._timers[jobID] = null;
                        // The job has taken too long to transfer the files, we set the job to DEAD
                        newJob.status.unshift(Constants.EAE_JOB_STATUS_DEAD) ;
                        _this._jobsCollection.findOneAndUpdate({_id: ObjectID(jobID)},
                            {$set: newJob},
                            {returnOriginal: false, w: 'majority', j: false}).then(function (res) {
                            resolve(res);
                        }, function (error) {
                            reject(ErrorHelper('Internal Mongo Error', error));
                        });
                    }
                }
            },function(error){
                reject(ErrorHelper('Internal Mongo Error', error));
            });
        }, _this._delay);
    });
};

module.exports = JobsManagement;