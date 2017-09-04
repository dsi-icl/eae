const timer = require('timers');
const request = require('request');
const { Constants, ErrorHelper } =  require('eae-utils');

/**
 * @class JobsScheduler
 * @desc Periodic scheduling and managing of jobs - Job Statuses Managed: Queued, Error, Cancelled, Done
 * @param mongoHelper Helper class to interact with Mongo
 * @constructor
 */
function JobsScheduler(mongoHelper) {
    // Init member attributes
    this._mongoHelper = mongoHelper;

    //Bind member functions
    this.startPeriodicUpdate = JobsScheduler.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = JobsScheduler.prototype.stopPeriodicUpdate.bind(this);

    // Action Methods
    this._queuedJobs = JobsScheduler.prototype._queuedJobs.bind(this);
    this._errorJobs = JobsScheduler.prototype._errorJobs.bind(this);
    this._canceledOrDoneJobs = JobsScheduler.prototype._canceledOrDoneJobs.bind(this);
}

JobsScheduler.prototype._queuedJobs = function () {
};

JobsScheduler.prototype._errorJobs = function () {
};

JobsScheduler.prototype._canceledOrDoneJobs = function () {

};

/**
 * @fn startPeriodicUpdate
 * @desc Start an automatic scheduling, error processing and post processing of the Jobs
 * @param delay The intervals (in milliseconds) on how often to update the status
 */
JobsScheduler.prototype.startPeriodicUpdate = function(delay = Constants.STATUS_DEFAULT_UPDATE_INTERVAL) {
    let _this = this;

    //Stop previous interval if any
    _this.stopPeriodicUpdate();
    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){
        _this._queuedJobs(); // Schedule Pending Jobs
        _this._errorJobs(); // Reschedule failed Jobs
        _this._canceledOrDoneJobs(); // Post processing of cancelled and done Jobs
    }, delay);
};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation of the compute status of the nodes
 * Does nothing if the periodic update was not running
 */
JobsScheduler.prototype.stopPeriodicUpdate = function() {
    let _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

module.exports = JobsScheduler;
