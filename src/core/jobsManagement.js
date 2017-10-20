const timer = require('timers');

/**
 * @fn Utils
 * @desc Manages the job from the Created status to the Queued status (from which the scheduler takes over)
 * @constructor
 */
function JobsManagement() {
    let _this = this;

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

    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){

    }, delay);

};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation of the compute status of the nodes
 * Does nothing if the periodic update was not running
 */
JobsManagement.prototype.stopJobMonitoring = function() {
    let _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

/**
 * @fn createJobManifestForCarriers
 * @desc Creates a manifest for the carriers to know which files to expect.
 * @param filesArray
 */
JobsManagement.prototype.createJobManifestForCarriers = function(filesArray){

};

module.exports = JobsManagement;