const carrierJobModel = {
    jobId: null,
    files:[],
    requester: '',
    numberOfTransferredFiles: 0,
    numberOfFilesToTransfer: 0,
    created: new Date()
};

module.exports = {
    carrier_models:{
        CARRIER_JOB_MODEL: carrierJobModel
    },
};
