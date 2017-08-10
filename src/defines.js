function ErrorStack(error_obj, error_stack) {
    var error = {};
    var error_message = '';

    error.toString = function() {
        return JSON.stringify(this);
    };

    //Extract current error message
    if (typeof error_obj === 'string')
        error_message = error_obj;
    else if (typeof error_obj === 'object' && error_obj.hasOwnProperty('message'))
        error_message = error_obj.message;
    else if (typeof error_obj === 'object' && error_obj.hasOwnProperty('error'))
        error_message = error_obj.error;
    else if (error_obj === undefined || error_obj === null)
        error_message = 'Undefined';
    else
        error_message = error_obj.toString();
    error.error =  error_message;

    //Extract error stack
    if (error_stack === undefined && error_obj.hasOwnProperty('stack'))
        error_stack = error_obj.stack;
    if (error_stack !== undefined) {
        if (error_stack instanceof Error)
            error.stack = { error: error_stack.message };
        else
            error.stack = error_stack;
    }

    return error;
}

const statusModel = {
    type: 'eae-service',
    status: 'eae_service_idle',
    statusLock: false,
    version: null,
    lastUpdate: null,
    port: 8080,
    ip: 'localhost',
    hostname: 'localhost',
    system: {
        arch: 'unknown',
        type: 'unknown',
        platform: 'unknown',
        version: '0.0'
    },
    cpu: {
        cores: [
        ],
        loadavg: [0, 0, 0]
    },
    memory: {
        total: 0,
        free: 0
    }
};


module.exports = {
    JOB_STATUS_QUEUED: 'eae_job_queued',
    JOB_STATUS_RUN: 'eae_job_running',
    JOB_STATUS_ERR: 'eae_job_error',
    JOB_STATUS_DONE: 'eae_job_done',

    SERVICE_STATUS_IDLE: 'eae_service_idle',
    SERVICE_STATUS_BUSY: 'eae_service_kartoffelsalat',
    SERVICE_STATUS_LOCKED: 'eae_service_locked',
    SERVICE_STATUS_DEAD: 'eae_service_dead',

    SERVICE_TYPE_COMPUTE: 'eae_compute',
    SERVICE_TYPE_SCHEDULER: 'eae_scheduler',
    SERVICE_TYPE_CARRIER: 'eae_carrier',
    SERVICE_TYPE_API: 'eae_api',

    STATUS_COLLECTION_NAME: 'eae_global_status',
    JOBS_COLLECTION_NAME: 'eae_global_jobs',
    statusDefaultUpdateInterval: 60 * 1000, // 60 * 1000 ms = 1 minute
    STATUS_MODEL: statusModel,
    errorStacker: ErrorStack
};
