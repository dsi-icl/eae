// Define the different models specific to the interface

const userTypes = {
    admin: 'ADMIN',
    standard: 'STANDARD'
};

const accessLevels = {
  antenna: 'antenna',
  aggregation_level_1: 'aggregation_level_1',
  aggregation_level_2: 'aggregation_level_2',
  cache_only: 'cache_only',
  none: 'none'
};

const transferType = {
  upload: 'UPLOAD',
  download: 'DOWNLOAD'
};

const userModel = {
    type: userTypes.standard,
    defaultAccessLevel: accessLevels.cache_only,
    authorizedAlgorithms: {},
    username: null,
    token: null,
    created: new Date()
};

const carrierJobModel = {
    jobId: null,
    type: '',
    files: [],
    requester: '',
    numberOfTransferredFiles: 0,
    numberOfFilesToTransfer: 0,
    created: new Date()
};

const unauthorizedAccess = {
    username: null,
    token: '',
    headers: null,
    accessTimestamp: new Date()

};

module.exports = {
    interface_models:{
        USER_MODEL: userModel,
        CARRIER_JOB_MODEL: carrierJobModel,
        UNAUTHORIZED_ACCESS_MODEL: unauthorizedAccess
    },
    interface_constants: {
        USER_TYPE: userTypes,
        ACCESS_LEVELS: accessLevels,
        TRANSFER_TYPE: transferType
    }
};
