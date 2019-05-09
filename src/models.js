const transferType = {
    upload: 'UPLOAD',
    download: 'DOWNLOAD'
};

const carrierJobModel = {
    jobId: null,
    type: '',
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
    carrier_constants: {
        TRANSFER_TYPE: transferType
    }
};
