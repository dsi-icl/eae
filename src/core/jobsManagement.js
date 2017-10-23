const timer = require('timers');
const { ErrorHelper, Constants } = require('eae-utils');
const ObjectID = require('mongodb').ObjectID;

/**
 * @fn Utils
 * @desc Manages the job from the Created status to the Queued status (from which the scheduler takes over)
 * @constructor
 */
function JobsManagement(carrierCollection, jobsCollection, delay = Constants.STATUS_DEFAULT_UPDATE_INTERVAL, maximumTimeForFileTransfer = 1000 * 3600 *12 ) {
    let _this = this;
    _this._carrierCollection = carrierCollection;
    _this._jobsCollection = jobsCollection;
    _this._timers = {};
    _this._delay = delay;
    _this._maximumTimeForFileTransfer = maximumTimeForFileTransfer;

    // Bind member functions
    _this.startJobMonitoring = JobsManagement.prototype.startJobMonitoring.bind(this);
    _this.createJobManifestForCarriers = JobsManagement.prototype.createJobManifestForCarriers.bind(this);
}

/**
 * @fn jobMonitoring
 * @desc Monitors the progress of the file transfer. When the file transfer is completed, it changes the status of the
 * job from data transfer to Queued.
 * @param jobID
 */
JobsManagement.prototype.startJobMonitoring =  function(jobID) {
    let _this = this;

    return new Promise(function(resolve, reject) {
        //Start a new interval update
        _this._timers[jobID] = timer.setInterval(function () {
            _this._carrierCollection.find({jobID : jobID}).then(function(carrierJob){
                // We check if the file transfer is completed
                if(carrierJob.transferedFiles === carrierJob.numberOfFilesToTransfer){
                    if (_this._timers[jobID] !== null && _this._timers[jobID] !== undefined) {
                        // We stop the timer
                        timer.clearInterval(_this._timers[jobID]);
                        _this._timers[jobID]= null;
                        // The job is ready for scheduling, we set the status of the job to QUEUED
                        _this._jobsCollection.findOneAndUpdate({_id: ObjectID(jobID)},
                                                               { $set : {status: Constants.EAE_JOB_STATUS_QUEUED}},
                                                               { returnOriginal: false, w: 'majority', j: false }).then(function (res) {
                            resolve(res);
                        },function(error){
                            reject(ErrorHelper('Internal Mongo Error', error));
                        });
                }}
                // We check if the file transfer has timed out
                let currentTime = new Date().getTime();
                let timeElapsed = currentTime - carrierJob.startTime.getTime();
                if( timeElapsed > _this._maximumTimeForFileTransfer ){
                    if (_this._timers[jobID] !== null && _this._timers[jobID] !== undefined) {
                        // We stop the timer
                        timer.clearInterval(_this._timers[jobID]);
                        _this._timers[jobID] = null;
                        // The job is ready for scheduling, we set the status of the job to QUEUED
                        _this._jobsCollection.findOneAndUpdate({_id: ObjectID(jobID)},
                            {$set: {status: Constants.EAE_JOB_STATUS_}},
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


/**
 * @fn createJobManifestForCarriers
 * @desc Creates a manifest for the carriers to know which files to expect.
 * @param filesArray
 */
JobsManagement.prototype.createJobManifestForCarriers = function(filesArray){

};

module.exports = JobsManagement;