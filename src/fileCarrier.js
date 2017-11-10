const { ErrorHelper } =  require('eae-utils');

/**
 * @class FileCarrier
 * @desc Manages the transfer of files between the client application and Swift to be then used by the computes units.
 * @param objectStorage Helper class to interact with Swift
 * @constructor
 */
function FileCarrier(objectStorage) {
    let _this = this;
    //Init member vars
    _this._objectStorage = objectStorage;

    //Bind member functions
    _this.initializeUpload = FileCarrier.prototype.initializeUpload.bind(this);
    _this.initializeDownload = FileCarrier.prototype.initializeDownload.bind(this);
    _this.setOutput = FileCarrier.prototype.setOutput.bind(this);

    // Bind private member functions
    _this._receiveFile = FileCarrier.prototype._receiveFile.bind(this);
}

/**
 * @fn initialize
 * @desc Prepares the execution of this transfer
 * @param request The Express.js HTTP request that triggered the execution
 * @param fileName The name of the file to be inserted into Swift
 * @return Promise
 */
FileCarrier.prototype.initializeUpload = function (request, fileName) {
    let _this = this;
    return new Promise(function (resolve, reject) {
        if (request !== null && request !== undefined) {
            if (request.hasOwnProperty('file')) {
                _this._receiveFile(request.file, fileName).then(function () {
                    resolve(true);
                }, function (file_error) {
                    reject(ErrorHelper('File upload error', file_error));
                });
            }
            else {
                reject(ErrorHelper('Missing file in the multipart form data'));
            }
        }
        else {
            reject(ErrorHelper('File query needs the multipart request'));
        }
    });
};

/**
 * @fn _receiveFile
 * @param file Uploaded multer file object
 * @param fileName The name of the file to be inserted into Swift
 * @return {Promise} Resolves to the file id in storage on success, rejects with error stack
 * @private
 */
FileCarrier.prototype._receiveFile = function(file, fileName) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        _this.setOutput(file.buffer, fileName).then(function(_unused__answer) {
            resolve(true);
        }, function(output_error) {
            reject(ErrorHelper('Upload file failed', output_error));
        });
    });
};

/**
 * @fn setOutput
 * @desc Creating the file in Swift with the specified name from teh data stream
 * @param data Raw data to store
 * @param fileName The name of the file to be inserted into Swift
 * @return {Promise} Resolve to true if insertion is ok, rejects an ErrorHelper otherwise
 */
FileCarrier.prototype.setOutput = function(data, fileName) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        _this._objectStorage.createObject(data, fileName).then(function(_unused__storage_id) {
            resolve(true);
        }, function(storage_error) {
            reject(ErrorHelper('Storing the file in Swift has failed', storage_error));
        });
    });
};

/**
 * @fn initializeDownload
 * @desc Initialize the data stream trasnfer to the requester.
 * @param fileName
 * @returns {Promise} Resolve to the data stream from swift if ok, rejects an ErrorHelper otherwise
 */
FileCarrier.prototype.initializeDownload = function(fileName){
    let _this = this;
    return new Promise(function (resolve, reject) {
        _this._objectStorage.getObject(fileName).then(function (data) {
            resolve(data); // Returns the data as stored
        }, function (storage_error) {
            reject(ErrorHelper('Download file failed', storage_error));
        });
    });
};


module.exports = FileCarrier;
