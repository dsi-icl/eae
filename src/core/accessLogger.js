const { interface_models } = require('../core/models.js');

/**
 * @fn AccessLogger
 * @desc Service to log illegal accesses
 * @param accessLogCollection
 * @constructor
 */
function AccessLogger(accessLogCollection) {
    let _this = this;
    _this._accessLogCollection = accessLogCollection;

    // Bind member functions
    _this.postNewJob = AccessLogger.prototype.logAccess.bind(this);
}

/**
 * @fn logAccess
 * @desc Methods that logs illegal accesses
 * @param request Illegal request to be logged
 */
AccessLogger.prototype.logAccess = function(request){
    let _this = this;
    let unauthorizedAccess = interface_models.UNAUTHORIZED_ACCESS_MODEL;
    unauthorizedAccess.username = request.query.eaeUsername;
    unauthorizedAccess.token = request.query.eaeUserToken;
    unauthorizedAccess.headers = request.headers;
    _this._accessLogCollection.insertOne(unauthorizedAccess);
};

module.exports = AccessLogger;