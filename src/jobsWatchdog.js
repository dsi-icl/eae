const timer = require('timers');
const { ErrorHelper, Constants } =  require('eae-utils');

/**
 * @class JobsWatchdog
 * @desc Periodic monitoring of jobs - Archive completed jobs, Invalidate timing out jobs
 * @param mongoHelper Helper class to interact with Mongo
 * @constructor
 */
function JobsWatchdog(mongoHelper) {
    //Init member vars
    this._intervalTimeout = null;
    this._mongoHelper = mongoHelper;

    //Bind member functions
    this.startPeriodicUpdate = JobsWatchdog.prototype.startPeriodicUpdate.bind(this);
    this.stopPeriodicUpdate = JobsWatchdog.prototype.stopPeriodicUpdate.bind(this);

    // Action Methods
    this._archiveJobs = JobsWatchdog.prototype._archiveJobs.bind(this);
    this._invalidateTimingOutJobs = JobsWatchdog.prototype._invalidateTimingOutJobs.bind(this);
}

/**
 * @fn _archiveJob
 */
JobsWatchdog.prototype._archiveJobs = function(){
    var _this = this;
    return new Promise(function(resolve, reject) {
        let statuses = [Constants.EAE_JOB_STATUS_COMPLETED];
        var currentTime = new Date();

        let filter = {
            status: {$in: statuses},
            statusLock: false,
            lastUpdate: {
                '$gte': new Date(0),
                '$lt': new Date(currentTime.setHours(currentTime.getHours() - global.eae_scheduler_config.jobsExpiredStatusTime))
            }
        };

        _this._nodesComputeStatus = _this._mongoHelper.retrieveJobs(filter).then(function (jobs) {

    });
};

/**
 * @fn startPeriodicUpdate
 * @desc Start an automatic update and synchronisation of the compute status of the nodes
 * @param delay The intervals (in milliseconds) on how often to update the status
 */
JobsWatchdog.prototype.startPeriodicUpdate = function(delay = Constants.statusDefaultUpdateInterval) {
    let _this = this;

    //Stop previous interval if any
    _this.stopPeriodicUpdate();
    //Start a new interval update
    _this._intervalTimeout = timer.setInterval(function(){
        _this._archiveJobs(); // Purge expired jobs
    }, delay);
};

/**
 * @fn stopPeriodicUpdate
 * @desc Stops the automatic update and synchronisation of the compute status of the nodes
 * Does nothing if the periodic update was not running
 */
JobsWatchdog.prototype.stopPeriodicUpdate = function() {
    let _this = this;

    if (_this._intervalTimeout !== null && _this._intervalTimeout !== undefined) {
        timer.clearInterval(_this._intervalTimeout);
        _this._intervalTimeout = null;
    }
};

module.exports = JobsWatchdog;