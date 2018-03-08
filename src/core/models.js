// Define the different models specific to the interface

const userTypes = {
    admin: 'ADMIN',
    standard: 'STANDARD'
};

const accessLevels = {
  antenna: { text:'antenna' ,value: 4},
  aggregation_level_1: { text:'aggregation_level_1' ,value: 3},
  aggregation_level_2: { text:'aggregation_level_2' ,value: 2},
  cache_only: { text:'cache_only' ,value: 1},
  none: { text:'none' ,value: 0}
};

const transferType = {
  upload: 'UPLOAD',
  download: 'DOWNLOAD'
};

const userModel = {
    type: userTypes.standard,
    defaultAccessLevel: accessLevels.none.text,
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
