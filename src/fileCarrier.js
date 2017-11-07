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
    _this.initialize = FileCarrier.prototype.initialize.bind(this);
    _this.setOutput = FileCarrier.prototype.setOutput.bind(this);

    // Bind private member functions
    _this._receiveFile = FileCarrier.prototype._receiveFile.bind(this);

}

/**
 * @fn initialize
 * @desc Prepares the execution of this transfer
 * @param request The Express.js HTTP request that triggered the execution
 * @return Promise
 */
FileCarrier.prototype.initialize = function (request) {
    let _this = this;
    return new Promise(function (resolve, reject) {
        if (request !== null && request !== undefined) {
            if (request.hasOwnProperty('file')) {
                _this._receiveFile(request.file).then(function () {
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
 * @fn setOutput
 * @desc Update this query Output data by storing the data in the cache, and updating the model
 * @param data Raw data to store
 * @return {Promise} Resolve to true if insertion is ok, rejects an ErrorHelper otherwise
 */
FileCarrier.prototype.setOutput = function(data) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        _this._objectStorage.createObject(data).then(function(_unused__storage_id) {
            resolve(true);
        }, function(storage_error) {
            reject(ErrorHelper('Caching output in storage failed', storage_error));
        });
    });
};


/**
 * @fn _receiveFile
 * @param file Uploaded multer file object
 * @private
 * @return {Promise} Resolves to the file id in storage on success, rejects with error stack
 */
FileCarrier.prototype._receiveFile = function(file) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        _this.setOutput(file.buffer).then(function(_unused__answer) {
            resolve(true);
        }, function(output_error) {
            reject(ErrorHelper('Upload file failed', output_error));
        });
    });
};



module.exports = FileCarrier;
