const { ErrorHelper } =  require('eae-utils');


/**
 * @class FileCarrier
 * @desc Manages the transfer of files between the client application and Swift to be then used by the computes units.
 * @param swiftHelper Helper class to interact with Swift
 * @constructor
 */
function FileCarrier(swiftStorage) {
    //Init member vars
    this._swiftStorage = swiftStorage;

    //Bind member functions
    this.setOutput = FileCarrier.prototype.setOutput.bind(this);
    this._receiveFile = FileCarrier.prototype._receiveFile.bind(this);

}


/**
 * @fn setOutput
 * @desc Update this query Output data by storing the data in the cache, and updating the model
 * @param data Raw data to store
 * @return {Promise} Resolve to the data model on success or reject an error
 */
FileCarrier.prototype.setOutput = function(data) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        _this._swiftStorage.createObject(data).then(function(__unused_storage_id) {
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
        _this.setOutput(file.buffer).then(function(__unused__answer) {
            resolve(true);
        }, function(output_error) {
            reject(ErrorHelper('Upload file failed', output_error));
        });
    });
};



module.exports = FileCarrier;