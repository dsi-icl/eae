/**
 * @fn CarrierController
 * @desc Controller to manage the file transfer between the outside and the swift in the eAE
 * @constructor
 */
function CarrierController() {

    // Bind member functions
    this.executeUpload = CarrierController.prototype.executeUpload.bind(this);
}

/**
 * @fn executeUpload
 * @desc Executes the query identified by the query_id
 * @param req Express.js request object
 * @param res Express.js response object
 */
CarrierController.prototype.executeUpload = function (req, res) {
    let _this = this;
    // queryObject.initialize(request)
};


module.exports = CarrierController;