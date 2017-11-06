const { ErrorHelper } = require('eae-utils');

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
 * @desc Executes the upload of the file to swift for the specified carrier job.
 * @param req Express.js request object
 * @param res Express.js response object
 */
CarrierController.prototype.executeUpload = function (req, res) {
    let _this = this;
    let jobID = req.body.jobID;
    let fileName = req.body.fileName;
    let eaeUsername = req.body.eaeUsername;

    try {
        if (eaeUsername === null || eaeUsername === undefined) {
            res.status(401);
            res.json(ErrorHelper('Missing username'));
        }

        if (jobID === null || jobID === undefined || fileName === null || fileName === undefined) {
            res.status(401);
            res.json(ErrorHelper('Missing InputId or FileName.\nInputId: ' + jobID + '\nfileName: ' + fileName));
        }
        else {

            _this._carrierCollection.findOne({jobId: jobID}).then(function(carrierJob){
                if(carrierJob === null){
                    res.status(401);
                    res.json(ErrorHelper('The job request do not exit. The query has been logged.'));
                }
                let isNotLegit = !(carrierJob.files.indexOf(fileName) > -1);
                if(isNotLegit){
                    res.status(401);
                    res.json(ErrorHelper('The proposed file for the upload is not valid.'));
                }
                if(carrierJob.requester === eaeUsername){
                    _this._fileCarrier.initialize(req).then(function (_unused__success) {
                        _this._carrierCollection.findOneAndUpdate({jobId: jobID},
                            {$inc: {numberOfTransferredFiles: 1}},
                            {returnOriginal: false, w: 'majority', j: false});
                        res.status(200);
                        res.json(true);
                    }, function (error) {
                        res.status(500);
                        res.json(ErrorHelper('Failed to upload file to Swift', error));
                    });
                }else{
                    res.status(401);
                    res.json(ErrorHelper('The username for this file transfer do not match the requester of the job.'));
                }
            },function(error){
                res.status(500);
                res.json(ErrorHelper('Internal Mongo Error', error));
            });
        }
    }
    catch (error) {
        res.status(500);
        res.json(ErrorHelper('Error occurred', error));
    }
};


module.exports = CarrierController;