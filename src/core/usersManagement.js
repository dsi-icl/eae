// const { interface_models, interface_constants } = require('../core/models.js');
const { ErrorHelper, Constants } = require('eae-utils');
const ObjectID = require('mongodb').ObjectID;
const check = require('check-types');


/**
 * @fn UsersManagement
 * @desc service to manage the creation, validity and update of the OPAL users.
 * @params usersCollection Collection containing all the platform users
 * @constructor
 */
function UsersManagement(usersCollection) {
    let _this = this;
    _this._usersCollection = usersCollection;

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
        //TODO: add verification here
        _this._usersCollection.insertOne(newUser).then(function(_unused__inserted){
                resolve(true);
            },
            function(error){
                reject(ErrorHelper('The new user coudln\'t be inserted.', error));
            });
    });
};

/**
 * @fn updateUser
 * @desc Update the record for an existing user.
 * @param user
 * @returns {Promise}
 */
UsersManagement.prototype.updateUser = function (user){
    let _this = this;
    return new Promise(function (resolve, reject) {
        //TODO: add verification here
        _this._usersCollection.findOneAndUpdate(user).then(function(_unused__inserted){
                resolve(true);
            },
            function(error){
                reject(ErrorHelper('The new user coudln\'t be inserted.', error));
            });
    });
};

module.exports = UsersManagement;
