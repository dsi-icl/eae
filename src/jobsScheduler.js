const { Constants, ErrorHelper } =  require('eae-utils');

/**
 * @class JobsScheduler
 * @param statusHelper
 * @constructor
 */
function JobsScheduler(statusHelper) {
    this._status_helper = statusHelper;

}

module.exports = JobsScheduler;
