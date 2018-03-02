// const { interface_models, interface_constants } = require('../core/models.js');
const { ErrorHelper } = require('eae-utils');
const { interface_constants } = require('../core/models.js');


/**
 * @fn UsersManagement
 * @desc service to manage the creation, validity and update of the OPAL users.
 * @params usersCollection Collection containing all the platform users
 * @params algorithmHelper Helper to interact with the algo service
 * @constructor
 */
function UsersManagement(usersCollection, algorithmHelper) {
    let _this = this;
    _this._usersCollection = usersCollection;
    _this._algoHelper = algorithmHelper;

    // Bind member functions
    this.validateUserAndInsert = UsersManagement.prototype.validateUserAndInsert.bind(this);
    this.updateUser = UsersManagement.prototype.updateUser.bind(this);
}

/**
 * @fn validateUserAndInsert
 * @desc Validates that the fields are well formed and then inserts it. If the user is not well formed, the insertion
 * is rejected and an error is raised.
 * @param newUser
 * @returns {Promise}
 */
UsersManagement.prototype.validateUserAndInsert = function (newUser){
    let _this = this;
    return new Promise(function (resolve, reject) {
        // We check that the access type exists
        if(!interface_constants.ACCESS_LEVELS.hasOwnProperty(newUser.defaultAccessLevel)){
            reject(ErrorHelper('The new user coudln\'t be inserted. The request access level is not supported : ', newUser.defaultAccessLevel));
            return;
        }
        // we check that the user type exists
        if(!interface_constants.USER_TYPE.hasOwnProperty(newUser.type.toLowerCase())){
            reject(ErrorHelper('The new user coudln\'t be inserted. The request type is not supported : ', newUser.type));
            return;
        }
        // we check that all algorithms of the user exist
        let authorized_algorithms = _this._algoHelper.getListOfAlgos();
        let keys = Object.keys(newUser.authorizedAlgorithms);
        let error = false;
        keys.forEach(function(key){
           if(!authorized_algorithms.hasOwnProperty(key)){
               reject(ErrorHelper('The new user contains an unknown algorithm: ' + key));
               error = true;
           }
        });

        if(!error){
        // All checks have passed we insert the user
        _this._usersCollection.insertOne(newUser).then(function(_unused__inserted){
                resolve(true);
            },
            function(error){
                reject(ErrorHelper('The new user coudln\'t be inserted.', error));
            });
    }});
};

/**
 * @fn updateUser
 * @desc Update the record for an existing user.
 * @param user Current user record
 * @param update Update to be applied.
 * @returns {Promise}
 */
UsersManagement.prototype.updateUser = function (user, update){
    let _this = this;
    return new Promise(function (resolve, reject) {

        let filter = { username : user};
        let updatedUser =  Object.assign({},user, update);
        _this._usersCollection.findOneAndUpdate(filter,
                { $set : updatedUser},
                { returnOriginal: true, w: 'majority', j: false })
            .then(function(inserted){
                resolve(inserted);
            },
            function(error){
                reject(ErrorHelper('The new user coudln\'t be inserted.', error));
            });
    });
};

module.exports = UsersManagement;
