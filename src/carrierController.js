/**
 * @fn CarrierController
 * @desc Controller to manage the file transfer between the outside and the swift in the eAE
 * @constructor
 */
function CarrierController() {

    // Bind member functions
    this.executeUpload = CarrierController.prototype.executeUpload.bind(this);
    this.setCollection = CarrierController.prototype.setCollection.bind(this);
}

/**
 * @fn setCollection
 * @desc Setup the mongoDB collection to work against
 * @param carrierCollection Initialized mongodb collection to work against
 */
CarrierController.prototype.setCollection = function(carrierCollection){
    this._carrierCollection = carrierCollection;
};

/**
 * @fn setFileCarrier
 * @desc Setup the fileCarrier service that will carry over the file to the swift storage.
 * @param fileCarrier
 */
CarrierController.prototype.setFileCarrier = function (fileCarrier) {
    this._fileCarrier = fileCarrier;
};

/**
 * @fn executeUpload
 * @desc Executes the query identified by the query_id
 * @param req Express.js request object
 * @param res Express.js response object
 */
CarrierController.prototype.executeUpload = function (req, res) {
    let _this = this;
    let inputId = req.params.input_id;
    let fileName = req.params.file_name;
    if (inputId === null || inputId === undefined || fileName === null || fileName === undefined) {
        res.status(401);
        res.json({ error: 'inputId: ' + inputId + '\nfileName: ' + fileName });
    }
    else {
        let replacementData = {inputId: inputId, fileName: fileName, status: 'Started', start: new Date()};
        _this._carrierCollection.findOneAndReplace({inputId: inputId, fileName: fileName},
            replacementData,
            { upsert: true, returnOriginal: false, w: 'majority', j: false })
            .then(function(success) {

                this._fileCarrier.initialize(req);
                res.status(200);
                res.json(true);
            }, function(error) {
                reject(ErrorHelper('Failed to record uploading of file for input: ' + input_id, error));
            });
    }
};


module.exports = CarrierController;