const os2 = require('os2');
const stream = require('stream');
const MemoryStream = require('memorystream');
const defines = require('./defines.js');

/**
 * @class SwiftHelper
 * @param options[in] {Object} A Js Object that contain these properties:
 *      - (Required){String} url: Address of the swift service
 *      - (Required){String} username: Name of the user
 *      - (Required){String} password: Password for this user
 *      - (Optional){Integer} chunkSize: Size of the segments when working with Large objects
 * @constructor
 */
function SwiftHelper(
        options = {
            url:  'http://127.0.0.1',
            username:  'admin',
            password: 'admin',
            chunkSize:  1024 * 1024 * 1024 - 1 // 1 Go
        }) {

    // Init member vars
    // Destructuring options to private attributes
    this._url = options.url;
    this._username = options.username;
    this._password = options.password;
    this._chunkSize = options.chunkSize;

    // Creates os2 instances
    this._store = new os2.Store(this._url);
    this._account = new os2.Account(this._store, this._username, this._password);

    // Bind private member functions
    this._authClosure = SwiftHelper.prototype._authClosure.bind(this);

    // Bind public member functions
    this.listContainers = SwiftHelper.prototype.listContainers.bind(this);
    this.createContainer = SwiftHelper.prototype.createContainer.bind(this);
    this.deleteContainer = SwiftHelper.prototype.deleteContainer.bind(this);
    this.statContainer = SwiftHelper.prototype.statContainer.bind(this);
    this.getContainerMetadata = SwiftHelper.prototype.getContainerMetadata.bind(this);
    this.setContainerMetadata = SwiftHelper.prototype.setContainerMetadata.bind(this);
    this.createFile = SwiftHelper.prototype.createFile.bind(this);
    this.deleteFile = SwiftHelper.prototype.deleteFile.bind(this);
    this.copyFile = SwiftHelper.prototype.copyFile.bind(this);
    this.getFileReadStream = SwiftHelper.prototype.getFileReadStream.bind(this);
    this.getFileWriteStream = SwiftHelper.prototype.getFileWriteStream.bind(this);
}

/**
 * @fn _authClosure
 * @desc Internal member function used to ensure a
 * valid authentication status before attempting any operations.
 * @param callback Member function to call when connected, MUST return a {Promise}.
 * @param args ES6 rest arguments, applied to the callback
 * @return {Promise} as returned by the callback parameter.
 * If authentication failed a {Promise} pre-rejected error stack is returned.
 * @private
 */
SwiftHelper.prototype._authClosure = function(callback, ...args) {
    let _this = this;

    if (_this._account === undefined || _this._account === null)
        return Promise.reject(defines.errorStacker('Swift account missing'));

    if (_this._account.isConnected()) {
        return callback.apply(_this, args);
    }
    return _this._account.connect().then(function(__unused__connected) {
        return callback.apply(_this, args);
    }, function(error) {
        return Promise.reject(defines.errorStacker('Failed to connect', error));
    });
};

/**
 * @fn listContainers
 * @desc Get all the containers from the Object store
 * @return {Promise} resolves to a json list of the containers name
 * on success, rejects an errorStack otherwise.
 */
SwiftHelper.prototype.listContainers = function() {
    let _this = this;
    return _this._authClosure(function(){
        return new Promise(function(resolve, reject) {
            _this._account.listContainers().then(function(container_list) {
                resolve(container_list);
            }, function(error) {
                reject(defines.errorStacker('Listing containers failed', error));
            });
        });
    });
};

/**
 * @fn createContainer
 * @desc Create a swift container from a given name
 * @param containerName {String} Container to create
 * @return {Promise} Resolves to a new {Container} instance on success,
 * rejects an error stack otherwise
 */
SwiftHelper.prototype.createContainer = function(containerName) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            c.create().then(function (__unused__ok) {
                resolve(c);
            }, function(error) {
                reject(defines.errorStacker('Creating container failed', error));
            });
        });
    });
};

/**
 * @fn deleteContainer
 * @desc Deletes a container from the swift object store.
 * Operation wil fail if the container is not empty.
 * @param containerName {String} Name of the container to remove
 * @return {Promise} Resolves to the status content on success, rejects an error stack otherwise.
 */
SwiftHelper.prototype.deleteContainer = function(containerName) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function(resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            c.delete().then(function(status) {
                resolve(status);
            }, function(error) {
                reject(defines.errorStacker('Delete container failed', error));
            });
        });
    });
};

/**
 * @fn statContainer
 * @desc Lists a container content
 * @param containerName  {String} The container to list
 * @return {Promise} Resolves to an {Array} of objects name or rejects to an error stack.
 */
SwiftHelper.prototype.statContainer = function(containerName) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            c.listObjects().then(function(objects) {
                resolve(objects);
            }, function(error) {
                reject(defines.errorStacker('Listing container content failed', error));
            });
        });
    });
};

/**
 * @fn getContainerMetadata
 * @desc Retrieve all the metadata stored in the desired container
 * @param containerName {String} Targeted container name
 * @return {Promise} On success resolves to a metadata key:value js object,
 * rejects error stack otherwise.
 */
SwiftHelper.prototype.getContainerMetadata = function(containerName) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            c.getMetadata().then(function(metadata) {
                resolve(metadata);
            }, function(error) {
                reject(defines.errorStacker('Reading container metadata failed', error));
            });
        });
    });
};

/**
 * @fn setContainerMetadata
 * @param containerName {String} Targeted container name
 * @param metadata {Object} Plain javascript object where each keyL:value is a meta field
 * @return {Promise} On success resolve to the updated metadata key:values or rejects an error stack
 */
SwiftHelper.prototype.setContainerMetadata = function(containerName, metadata) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            c.setMetadata(metadata).then(function(set_metadata) {
                resolve(set_metadata);
            }, function(error) {
                reject(defines.errorStacker('Writing container metadata failed', error));
            });
        });
    });
};

/**
 * @fn createFile
 * @desc Create a file from a string, a Buffer or a readable stream
 * @param containerName {String} Name of the container of the new file
 * @param filename {String} Name of the new file
 * @param fileRef {String|Buffer|Readable} File content to write in storage
 * @return {Promise} Resolves to created {StaticLargeObject} instance or rejects an error stack.
 */
SwiftHelper.prototype.createFile = function(containerName, filename, fileRef) {
    let _this = this;
    filename = new String(filename); // Conversion to String object in case of a primitive string
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            let s = new os2.StaticLargeObject(c, filename);
            let data_stream = null;

            //If content is a string or buffer, transform it to a stream
            if (fileRef instanceof String || fileRef instanceof Buffer)
                data_stream = new MemoryStream(Buffer.from(fileRef));

            // Is a readable stream
            if (stream.Readable.prototype.isPrototypeOf(fileRef))
                data_stream = fileRef;

            // Conversion failed or type is not supported
            if (data_stream === null || data_stream === undefined) {
                reject(defines.errorStacker('Invalid file input ' + typeof fileRef));
                return;
            }

            // Start uploading
            s.createFromStream(data_stream, _this._chunkSize).then(function(create_status) {
                resolve(create_status);
            }, function(error) {
                reject(defines.errorStacker('os2 creating file failed', error));
            });
        });
    });
};

/**
 * @fn deleteFile
 * @desc Removes a file from the object storage
 * @param containerName {String} Container of the file
 * @param filename {String} Name of the file to remove
 * @return {Promise} Resolves to the deletion status on success,
 * rejects to an error stack if something went wrong
 */
SwiftHelper.prototype.deleteFile = function(containerName, filename) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            let s = new os2.StaticLargeObject(c, filename);
            s.deleteWithContent().then(function(delete_status) {
                resolve(delete_status);
            }, function(error) {
                reject(defines.errorStacker('Delete file failed', error));
            });
        });
    });
};

/**
 * @fn copyFile
 * @desc Copies a file from one container to another container
 * @param dstContainer {String} Destination container name
 * @param dstFile {String} Destination file name
 * @param srcContainer {String} Original container name
 * @param srcFile {String} Original filename
 * @return {Promise} Resolves to the copy status on success,
 * rejects to an error stack if something went wrong
 */
SwiftHelper.prototype.copyFile = function(dstContainer, dstFile, srcContainer, srcFile) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let dstC = new os2.Container(_this._account, dstContainer);
            let srcC = new os2.Container(_this._account, srcContainer);
            let dstF = new os2.StaticLargeObject(dstC, dstFile);
            let srcF = new os2.StaticLargeObject(srcC, srcFile);
            srcF.copy(dstF).then(function(copy_status) {
                resolve(copy_status);
            }, function(error) {
                reject(defines.errorStacker('Copy file failed', error));
            });
        });
    });
};

/**
 * @fn getFileReadStream
 * @param containerName {String} Container name
 * @param filename {String} Filename in the container
 * @return {Promise} returns a Promise that resolve to a {stream.Readable} on success,
 * rejects an error stack otherwise.
 */
SwiftHelper.prototype.getFileReadStream = function(containerName, filename) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, reject) {
            let c = new os2.Container(_this._account, containerName);
            let s = new os2.StaticLargeObject(c, filename);
            s.getContentStream(false).then(function(readStream) {
                resolve(readStream);
            }, function(error) {
                reject(defines.errorStacker('Reading file failed', error));
            });
        });
    });
};

/**
 * @fn getFileWriteStream
 * @param containerName {String} Container name
 * @param filename {String} Filename in the container
 * @return {Promise} returns a Promise that resolve to a {stream.Writable} on success,
 * rejects an error stack otherwise.
 */
SwiftHelper.prototype.getFileWriteStream = function(containerName, filename) {
    let _this = this;
    return _this._authClosure(function() {
        return new Promise(function (resolve, __unused__reject) {
            let c = new os2.Container(_this._account, containerName);
            let s = new os2.StaticLargeObject(c, filename);
            let stream = new MemoryStream();
            s.createFromStream(stream, _this.chunkSize);
            resolve(stream);
        });
    });
};

module.exports = SwiftHelper;
