/**
 * @fn CarrierController
 * @desc Controller to manage the file transfer between the outside and the swift in the eAE
 * @param statusHelper Helper class to interact with status
 * @constructor
 */
function CarrierController(statusHelper) {
    this._helper = statusHelper;

    // Bind member functions
    // this._receiveFile = CarrierController.prototype._receiveFile.bind(this);
}



module.exports = CarrierController;