
/**
 * @fn Utils
 * @desc Utility class
 * @constructor
 */
function Utils() {
    let _this = this;

    // Bind member functions
    _this.generateUUID = Utils.prototype.generateUUID.bind(this);
}


Utils.prototype.generateUUID =  function() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

module.exports = Utils;