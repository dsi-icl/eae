const { Constants, ErrorHelper } =  require('eae-utils');

function JobScheduler( statusHelper) {
    this._status_helper = statusHelper;

    this.runJob = JobController.prototype.scheduleJob.bind(this);
}

module.exports = JobScheduler;
