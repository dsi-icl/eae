//Include utility classes
let StatusHelperModule = require('./status.js');
let SwiftHelperModule = require('./swift.js');
const defines = require('./defines.js');

//Expose utilities in package
module.exports = {
    StatusHelper: StatusHelperModule,
    SwiftHelper: SwiftHelperModule,
    ErrorHelper: defines.errorStacker,
    DataModels: {
        EAE_STATUS_MODEL: defines.STATUS_MODEL,
        EAE_JOB_MODEL: defines.JOB_MODEL
    },
    Constants: {
        EAE_SERVICE_TYPE_COMPUTE: defines.SERVICE_TYPE_COMPUTE,
        EAE_SERVICE_TYPE_SCHEDULER: defines.SERVICE_TYPE_SCHEDULER,
        EAE_SERVICE_TYPE_CARRIER: defines.SERVICE_TYPE_CARRIER,
        EAE_SERVICE_TYPE_API: defines.SERVICE_TYPE_API,

        EAE_SERVICE_STATUS_IDLE: defines.SERVICE_STATUS_IDLE,
        EAE_SERVICE_STATUS_BUSY: defines.SERVICE_STATUS_BUSY,
        EAE_SERVICE_STATUS_LOCKED: defines.SERVICE_STATUS_LOCKED,
        EAE_SERVICE_STATUS_DEAD: defines.SERVICE_STATUS_DEAD,

        EAE_JOB_TYPE_PYTHON2: defines.JOB_TYPE_PYTHON2,
        EAE_JOB_TYPE_PIP: defines.JOB_TYPE_PIP,

        EAE_JOB_STATUS_QUEUED: defines.JOB_STATUS_QUEUED,
        EAE_JOB_STATUS_SCHEDULED: defines.JOB_STATUS_SCHEDULED,
        EAE_JOB_STATUS_RUNNING: defines.JOB_STATUS_RUN,
        EAE_JOB_STATUS_ERROR: defines.JOB_STATUS_ERR,
        EAE_JOB_STATUS_CANCELLED: defines.JOB_STATUS_CANCELLED,
        EAE_JOB_STATUS_DONE: defines.JOB_STATUS_DONE,
        EAE_JOB_STATUS_COMPLETED: defines.JOB_STATUS_COMPLETED,

        EAE_COLLECTION_STATUS: defines.STATUS_COLLECTION_NAME,
        EAE_COLLECTION_JOBS: defines.JOBS_COLLECTION_NAME
    }
};
