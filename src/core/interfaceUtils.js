let crypto = require('crypto');
// crypto.DEFAULT_ENCODING = 'hex';

/**
 * @fn InterfaceUtils
 * @desc Utility class
 * @param config
 * @constructor
 */
function InterfaceUtils(config = {}) {
    let _this = this;
    _this.config = config;

    // Bind member functions
    _this.generateUUID = InterfaceUtils.prototype.generateToken.bind(this);
}

/**
 * @fn generateToken
 * @desc Genereates an AES token to be used as a token by the user for authentication
 * @returns {string}
 */
InterfaceUtils.prototype.generateToken =  function(userProfile) {
    let salt = crypto.randomBytes(32);
    let iterations = 10000;
    let keyByteLength = 512; // desired length for an AES key
    let password = userProfile.username + userProfile.created;

    return crypto.pbkdf2Sync(password, salt, iterations, keyByteLength, 'sha512').toString('hex');
};

module.exports = InterfaceUtils;
