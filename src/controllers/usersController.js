const { interface_constants } = require('../core/models.js');
const { ErrorHelper } = require('eae-utils');

/**
 * @fn UsersController
 * @desc Controller to manage the users service
 * @param usersCollection
 * @param accessLogger
 * @constructor
 */
function UsersController(usersCollection, accessLogger) {
    let _this = this;
    _this._usersCollection = usersCollection;
    _this._accessLogger = accessLogger;

    // Bind member functions
    _this.getUser = UsersController.prototype.getUser.bind(this);
    _this.createUser = UsersController.prototype.createUser.bind(this);
    _this.deleteUser = UsersController.prototype.deleteUser.bind(this);
}


/**
 * @fn getUser
 * @desc Sends back the profile of the requested user
 * @param req Incoming message
 * @param res Server Response
 */
UsersController.prototype.getUser = function(req, res){
    let _this = this;
    let requestedUsername = req.body.username;
    let eaeUsername = req.body.eaeUsername;
    let userToken = req.body.eaeUserToken;

    if (eaeUsername === null || eaeUsername === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing eaeUsername or token'));
        return;
    }
    try {
        let filter = {
            username: eaeUsername,
            token: userToken
        };
        _this._usersCollection.findOne(filter).then(function (user) {
            if (user === null) {
                res.status(401);
                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return
            }
            if (user.type === interface_constants.USER_TYPE.admin) {
                _this._usersCollection.findOne({username: requestedUsername}).then(function(user){
                        if (user === null) {
                            res.status(200);
                            res.json("User " + requestedUsername + " doesn't exist.");
                        }else {
                            delete user._id;
                            res.status(200);
                            res.json(user);
                        }
                    },
                    function(error){
                        res.status(500);
                        res.json(ErrorHelper('Internal Mongo Error', error))
                    });
            }else{
                res.status(401);
                res.json(ErrorHelper('The user is not authorized to access this command'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
            }
        });
    }
    catch (error) { // ObjectID creation might throw
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

/**
 * @fn createUser
 * @desc Create a new user to get access to the platform
 * @param req Incoming message
 * @param res Server Response
 */
UsersController.prototype.createUser = function(req, res){
    let _this = this;
    let userTobeCreated = req.body.username;
    let eaeUsername = req.body.eaeUsername;
    let userToken = req.body.eaeUserToken;
    let newUser = JSON.parse(req.body.newUser);

    if (eaeUsername === null || eaeUsername === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing user_id or token'));
        return;
    }
    try {
        let filter = {
            username: eaeUsername,
            token: userToken
        };
        _this._usersCollection.findOne(filter).then(function (user) {
            if (user === null) {
                res.status(401);
                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return
            }
            if (user.type === interface_constants.USER_TYPE.admin) {
                //check that user doesn't already exists
                _this._usersCollection.findOne({username: userTobeCreated}).then( function (user) {
                    if(user === null){
                        _this._usersCollection.insertOne(newUser).then(function(__unused_inserted){
                                res.status(200);
                                res.json('The user ' + userTobeCreated + ' has been successfully created');
                            },
                            function(error){
                                res.status(500);
                                res.json(ErrorHelper('Internal Mongo Error', error))
                            });
                    }else{
                        res.status(409);
                        res.json('The user ' + userTobeCreated + ' already exists.');
                    }
                },function(error){

                });
            }else{
                res.status(401);
                res.json(ErrorHelper('The user is not authorized to access this command'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
            }
        });
    }
    catch (error) { // ObjectID creation might throw
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

/**
 * @fn deleteUser
 * @desc Delete an existing user to remove access to the platform
 * @param req Incoming message
 * @param res Server Response
 */
UsersController.prototype.deleteUser = function(req, res){
    let _this = this;
    let userToBeDeleted = req.body.username;
    let eaeUsername = req.body.eaeUsername;
    let userToken = req.body.eaeUserToken;

    if (eaeUsername === null || eaeUsername === undefined || userToken === null || userToken === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing user_id or token'));
        return;
    }
    try {
        let filter = {
            username: eaeUsername,
            token: userToken
        };
        _this._usersCollection.findOne(filter).then(function (user) {
            if (user === null) {
                res.status(401);
                res.json(ErrorHelper('Unauthorized access. The unauthorized access has been logged.'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
                return
            }
            if (user.type === interface_constants.USER_TYPE.admin) {
                //check that user doesn't already exists
                _this._usersCollection.findOne({username: userToBeDeleted}).then( function (user) {
                    if(user !== null){
                        _this._usersCollection.deleteOne({username: userToBeDeleted}).then(function(__unused_deleted){
                                res.status(200);
                                res.json('The user ' + userToBeDeleted + ' has been successfully deleted');
                            },
                            function(error){
                                res.status(500);
                                res.json(ErrorHelper('Internal Mongo Error', error))
                            });
                    }else{
                        res.status(409);
                        res.json('The user ' + userToBeDeleted + ' doesn\'t exists.');
                    }
                },function(error){

                });
            }else{
                res.status(401);
                res.json(ErrorHelper('The user is not authorized to access this command'));
                // Log unauthorized access
                _this._accessLogger.logAccess(req);
            }
        });
    }
    catch (error) { // ObjectID creation might throw
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};

module.exports = UsersController;