
/**
 * @fn Utils
 * @desc Utility class
 * @param config
 * @constructor
 */
function InterfaceUtils(config = {}) {
    let _this = this;
    _this.config = config;

    // Bind member functions
    _this.generateUUID = InterfaceUtils.prototype.generateUUID.bind(this);
}

/**
 * @fn generateUUID
 * @desc Genereates a UUID to be used as a token by the user for authentication
 * @returns {string}
 */
InterfaceUtils.prototype.generateUUID =  function() {
    var uuid = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 32; i++)
        uuid += possible.charAt(Math.floor(Math.random() * possible.length));

    return uuid;
};

module.exports = InterfaceUtils;