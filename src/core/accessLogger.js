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
    let unauthorizedAccessModel = interface_models.UNAUTHORIZED_ACCESS_MODEL;
    let unauthorizedAccess = Object.assign(unauthorizedAccessModel,
                                            {username: request.query.eaeUsername,
                                            token: request.query.eaeUserToken,
                                            headers:  request.headers});
    _this._accessLogCollection.insertOne(unauthorizedAccess);
};

module.exports = AccessLogger;