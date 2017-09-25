const { ErrorHelper } =  require('eae-utils');


/**
 * @class FileCarrier
 * @desc Manages the transfer of files between the client application and Swift to be then used by the computes units.
 * @param swiftHelper Helper class to interact with Swift
 * @constructor
 */
function FileCarrier(swiftHelper) {
    //Init member vars
    this._swiftHelper = swiftHelper;

    //Bind member functions
    this.pipeStreamToSwift = FileCarrier.prototype.pipeStreamToSwift.bind(this);

}

FileCarrier.prototype.pipeStreamToSwift = function(containerName, fileName, readableStream){
    let _this = this;

    return new Promise(function(resolve, reject) {
        const writer = _this._swiftHelper.getFileWriteStream(containerName, fileName);
        const reader = readableStream;

        if(reader === undefined || reader === null || writer === undefined || writer === null){
            reject(ErrorHelper('The writer or the reader is null or undefined.\nReader: ' + reader.toString() +
                '\nWriter: ' + writer.toString()));
        }

        resolve(reader.pipe(writer));
    });
};



/**
 * @fn setOutput
 * @desc Update this query Output data by storing the data in the cache, and updating the model
 * @param data Raw data to store
 * @return {Promise} Resolve to the data model on success or reject an error
 */
FileCarrier.prototype.setOutput = function(data) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        _this._storage.createObject(data).then(function(storage_id) {
            // Update model to remember where we stored the data
            let data_model = Object.assign({}, Models.BL_MODEL_DATA,
                {
                    cache: {
                        dataSize: data.length,
                        storageId: storage_id
                    }
                });
            _this.setOutputModel(data_model); // Overrides previous cache
            _this._pushModel().then(function() {
                resolve(data_model);
            }, function(push_error) {
                reject(ErrorHelper('Saving output query model failed', push_error));
            });
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
        _this.setOutput(file.buffer).then(function(__unused__data_model) {
            resolve(true);
        }, function(output_error) {
            reject(ErrorHelper('Upload file failed', output_error));
        });
    });
};



module.exports = FileCarrier;