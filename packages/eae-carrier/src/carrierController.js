const { ErrorHelper } = require('eae-utils');
const FileCarrier = require('./fileCarrier.js');
const ObjectStorage = require('./objectStorage.js');

/**
 * @fn CarrierController
 * @desc Controller to manage the file transfer between the outside and the swift in the eAE
 * @constructor
 */
function CarrierController(swiftConfig) {
    let _this = this;
    _this._carrierCollection = null;
    _this._swiftConfig = swiftConfig;

    // Bind member functions
    _this.executeUpload = CarrierController.prototype.executeUpload.bind(this);
    _this.executeDownload = CarrierController.prototype.executeDownload.bind(this);
    _this.setCollection = CarrierController.prototype.setCollection.bind(this);
}

/**
 * @fn setCollection
 * @desc Setup the mongoDB collection to work against
 * @param carrierCollection Initialized mongodb collection to work against
 */
CarrierController.prototype.setCollection = function(carrierCollection){
    let _this = this;
    _this._carrierCollection = carrierCollection;
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
            return;
        }

        if (jobID === null || jobID === undefined || fileName === null || fileName === undefined) {
            res.status(401);
            res.json(ErrorHelper('Missing jobID or FileName.\njobID: ' + jobID + '\nfileName: ' + fileName));
        }else {
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
                    let objectStorage = new ObjectStorage(_this._swiftConfig,jobID,'input');
                    let fileCarrier = new FileCarrier(objectStorage);
                    fileCarrier.initializeUpload(req, fileName).then(function (_unused__success) {
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

/**
 * @fn executeDownload
 * @desc Serves the requested the file from the swift for the specified carrier job.
 * @param req Express.js request object
 * @param res Express.js response object
 */
CarrierController.prototype.executeDownload = function (req, res) {
    let _this = this;
    let jobID = req.body.jobID;
    let fileName = req.body.fileName;
    let eaeUsername = req.body.eaeUsername;

    try {
        if (eaeUsername === null || eaeUsername === undefined) {
            res.status(401);
            res.json(ErrorHelper('Missing username'));
            return;
        }

        if (jobID === null || jobID === undefined || fileName === null || fileName === undefined) {
            res.status(401);
            res.json(ErrorHelper('Missing jobID or FileName.\njobID: ' + jobID + '\nfileName: ' + fileName));
        }else {
            _this._carrierCollection.findOne({jobId: jobID}).then(function (carrierJob) {
                if (carrierJob === null) {
                    res.status(401);
                    res.json(ErrorHelper('The job request do not exit. The query has been logged.'));
                }
                let isNotLegit = !(carrierJob.files.indexOf(fileName) > -1);
                if(isNotLegit){
                    res.status(401);
                    res.json(ErrorHelper('The proposed file for download is not valid.'));
                }
                if (carrierJob.requester === eaeUsername) {
                    let objectStorage = new ObjectStorage(_this._swiftConfig,jobID,'output');
                    let fileCarrier = new FileCarrier(objectStorage);
                    fileCarrier.initializeDownload(fileName).then(function (data) {
                        _this._carrierCollection.findOneAndUpdate({jobId: jobID},
                            {$inc: {numberOfTransferredFiles: 1}},
                            {returnOriginal: false, w: 'majority', j: false});
                        res.status(200);
                        //Read data and write data to response
                        data.on('data', function (chunk) {
                            let stringifiedChunk = chunk.toString();
                            res.write(stringifiedChunk);
                        });
                        //Reading done, resolve
                        data.on('end', function () {
                            res.end();
                        });
                        //Handling errors
                        data.on('error', function (error) {
                            res.json(ErrorHelper('Readable error', error));
                        });
                    }, function (error) {
                        res.status(500);
                        res.json(ErrorHelper('Failed download file from Swift', error));
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
