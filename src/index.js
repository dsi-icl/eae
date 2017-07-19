//Include utility classes
var StatusHelperModule = require('./status.js');
var defines = require('./defines.js');

//Expose utilities in package
module.exports = {
    ErrorHelper: defines.errorStacker,
    StatusHelper: StatusHelperModule,
    DataModels: {
        EAE_STATUS_MODEL: defines.STATUS_MODEL
    },
    Constants: {
        EAE_JOB_STATUS_QUEUED: defines.JOB_STATUS_QUEUED,
        EAE_JOB_STATUS_RUNNING: defines.JOB_STATUS_RUN,
        EAE_JOB_STATUS_ERROR: defines.JOB_STATUS_ERR,
        EAE_JOB_STATUS_DONE: defines.JOB_STATUS_DONE,

        EAE_SERVICE_STATUS_IDLE: defines.SERVICE_STATUS_IDLE,
        EAE_SERVICE_STATUS_BUSY: defines.SERVICE_STATUS_BUSY,
        EAE_SERVICE_STATUS_LOCKED: defines.SERVICE_STATUS_LOCKED,
        EAE_SERVICE_STATUS_DEAD: defines.SERVICE_STATUS_DEAD,

        EAE_COLLECTION_STATUS: defines.STATUS_COLLECTION_NAME,
        EAE_COLLECTION_JOBS: defines.JOBS_COLLECTION_NAME
    }
};
