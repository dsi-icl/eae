//Include utility classes
var StatusHelperModule = require('./status.js');
var defines = require('./defines.js');

//Expose utilities in in package
module.exports = {
    ErrorHelper: defines.errorStacker,
    StatusHelper: StatusHelperModule,
    DataModels: {
        EAE_STATUS_MODEL: defines.EAE_STATUS_MODEL
    },
    Constants: {
        EAE_STATUS_COLLECTION: defines.EAE_STATUS_COLLECTION
    }
};