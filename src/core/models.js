// Define the different models specific to the interface

const userTypes = {
    admin: 'ADMIN',
    standard: 'STRANDARD'
};

const userModel = {
    type : userTypes.standard,
    username : '',
    token : null,
    created: new Date(0)
};

const unauthorizedAccess = {
    username : null,
    token: '',
    ip : null,
    accessTimestamp: new Date(0)

};

module.exports = {
    models:{
        USER_MODEL: userModel,
        UNAUTHORIZED_ACCESS_MODEL: unauthorizedAccess
    },
    Constants: {
        USER_TYPE: userTypes
    }
};