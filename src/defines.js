function ErrorStack(error_obj, error_stack) {
    let error = {};
    let error_message = '';

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
    computeType: [],
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

const jobModel = {
    type : 'eae-job-type',
    status: ['eae_job_created'],
    startDate: new Date(),
    requester: 'Raijin',
    main: 'main.py',
    params: [],
    input: [],
    endDate: new Date(0),
    exitCode: -1,
    stdout: null,
    stderr: null,
    output: [],
    message: null,
    statusLock: false,
    executorIP: '127.0.0.1',
    executorPort: '9000'
};

module.exports = {
    SERVICE_TYPE_COMPUTE: 'eae_compute',
    SERVICE_TYPE_SCHEDULER: 'eae_scheduler',
    SERVICE_TYPE_CARRIER: 'eae_carrier',
    SERVICE_TYPE_API: 'eae_api',

    SERVICE_STATUS_IDLE: 'eae_service_idle',
    SERVICE_STATUS_BUSY: 'eae_service_kartoffelsalat',
    SERVICE_STATUS_LOCKED: 'eae_service_locked',
    SERVICE_STATUS_DEAD: 'eae_service_dead',

    JOB_TYPE_PYTHON2: 'python2',
    JOB_TYPE_PIP: 'pip',
    JOB_TYPE_SPARK: 'spark',
    JOB_TYPE_R: 'r',

    COMPUTE_TYPE_PYTHON2: 'python2',
    COMPUTE_TYPE_R: 'r',
    COMPUTE_TYPE_SPARK: 'spark',
    COMPUTE_TYPE_TENSORFLOW: 'tensorflow',

    JOB_STATUS_CREATED: 'eae_job_created',
    JOB_STATUS_TRANSFERRING_DATA: 'eae_job_transferring_data',
    JOB_STATUS_QUEUED: 'eae_job_queued',
    JOB_STATUS_SCHEDULED: 'eae_job_scheduled',
    JOB_STATUS_RUN: 'eae_job_running',
    JOB_STATUS_ERR: 'eae_job_error',
    JOB_STATUS_CANCELLED: 'eae_job_cancelled',
    JOB_STATUS_DONE: 'eae_job_done',
    JOB_STATUS_DEAD: 'eae_job_dead',
    JOB_STATUS_COMPLETED: 'eae_job_completed',
    JOB_STATUS_ARCHIVED: 'eae_job_archived',

    STATUS_COLLECTION_NAME: 'eae_global_status',
    JOBS_COLLECTION_NAME: 'eae_global_jobs',
    JOBS_ARCHIVE_COLLECTION_NAME: 'eae_jobs_archive',
    FAILED_JOBS_COLLECTION_NAME: 'eae_failed_jobs_archive',
    USERS_COLLECTION_NAME: 'eae_users',
    ACCESS_LOG_NAME: 'eae_access_log',
    STATUS_DEFAULT_UPDATE_INTERVAL: 60 * 1000, // 60 * 1000 ms = 1 minute
    CARRIER_COLLECTION_NAME: 'eae_carrier',

    STATUS_MODEL: statusModel,
    JOB_MODEL: jobModel,
    errorStacker: ErrorStack
};
