const { ErrorHelper } = require('eae-utils');
const uuid = require('uuid');
const os2 = require('os2');
const MemoryStream = require('memorystream');

/**
 * @fn ObjectStorage
 * @param options[in] A Plain JS object describing the swift object storage endpoint
 *
 * @constructor
 */
function ObjectStorage(
    options = {
        url: 'http://127.0.0.1',
        username: 'admin',
        password: 'admin',
        chunkSize: 1024 * 1024 * 1024 - 1 // 1 Go
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
    this._container = new os2.Container(this._account, 'toto_input'); // TODO: PUT the poper name! -- mongo id + _input

    // Internal ready status
    this._storage_ready = false;

    // Bind public member functions
    this.createObject = ObjectStorage.prototype.createObject.bind(this);
    this.getObject = ObjectStorage.prototype.getObject.bind(this);
    this.setObject = ObjectStorage.prototype.setObject.bind(this);
    this.deleteObject = ObjectStorage.prototype.deleteObject.bind(this);

    // Bind Private methods
    this._internalClosure = ObjectStorage.prototype._internalClosure.bind(this);
    this._generateFilename = ObjectStorage.prototype._generateFilename.bind(this);
}

/**
 * @fn _internalClosure
 * @desc Internal member function used to ensure a
 * valid authentication status and a valid container exists before attempting any operations.
 * @param callback Member function to call when connected, MUST return a {Promise}.
 * @param args ES6 rest arguments, applied to the callback --> .apply(_this, args)
 * @return {Promise} as returned by the callback parameter.
 * If authentication failed a {Promise} pre-rejected error stack is returned.
 * @private
 */
ObjectStorage.prototype._internalClosure = function (callback, ...args) {
    let _this = this;

    let _auth_check = function () {
        return new Promise(function (resolve, reject) {
            if (_this._account === undefined || _this._account === null)
                reject(ErrorHelper('Swift account missing'));
            else if (_this._account.isConnected())
                resolve(true);
            else {
                _this._account.connect().then(function (connected) {
                    resolve(connected);
                }, function (error) {
                    reject(ErrorHelper('Failed to connect', error));
                });
            }
        });
    };

    let _container_check = function () {
        return new Promise(function (resolve, reject) {
            if (_this._container === undefined || _this._container === null)
                reject(ErrorHelper('Missing swift container'));
            else if (_this._storage_ready === true)
                resolve(true);
            else {
                _this._container.create().then(function (create_ok) {
                    resolve(create_ok);
                }, function (error) {
                    reject(ErrorHelper('Failed to create container', error));
                });
            }
        });
    };

    return _auth_check().then(function (_unused___auth_ok) {
        return _container_check().then(function (_unused__container_ok) {
            // Set global ready storage
            _this._storage_ready = true;
            return callback.apply(_this, args);
        }, function (container_error) {
            return Promise.reject(ErrorHelper('Container check failed', container_error));
        });
    }, function (auth_error) {
        return Promise.reject(ErrorHelper('Auth check failed', auth_error));
    }
    );
};

/**
 * @fn createObject
 * @param object_data String or Buffer data to store in a new object
 * @return {Promise} Resolves to object id on success
 */
ObjectStorage.prototype.createObject = function (object_data) {
    let _this = this;

    return _this._internalClosure(function () {
        return new Promise(function (resolve, reject) {
            let objName = _this._generateFilename();
            let obj = new os2.StaticLargeObject(_this._container, objName);
            let data_stream = new MemoryStream();

            obj.createFromStream(data_stream, _this._chunkSize).then(function (_unused__obj_ok) {
                resolve(objName);
            }, function (obj_error) {
                reject(ErrorHelper('Creating new entry in object store failed', obj_error));
            });

            // Close the stream
            data_stream.end(Buffer.from(object_data));
        });
    });
};

/**
 * @fn getObject
 * @param object_id Reference identifier for the data
 * @return {Promise} Resolves to the data content into a String
 */
ObjectStorage.prototype.getObject = function (object_id) {
    let _this = this;
    return _this._internalClosure(function () {
        return new Promise(function (resolve, reject) {
            try {
                let data = '';

                // Open file in swift
                let obj = new os2.StaticLargeObject(_this._container, object_id);
                obj.getContentStream().then(function (readable) {
                    //Read data and accumulate to var data
                    readable.on('data', function (chunk) {
                        data += chunk;
                    });
                    //Reading done, resolve
                    readable.on('end', function () {
                        resolve(data);
                    });
                    //Handling errors
                    readable.on('error', function (error) {
                        reject(ErrorHelper('Readable error', error));
                    });

                }, function (read_error) {
                    reject(ErrorHelper('Get content failed', read_error));
                });
            }
            catch (error) {
                reject(ErrorHelper(error));
            }
        });
    });
};

/**
 * @fn setObject
 * @param object_id Reference identifier for the object to update
 * @param object_data New content for this data point
 * @return {Promise} Resolves to the object ID on success
 */
ObjectStorage.prototype.setObject = function (object_id, object_data) {
    let _this = this;
    return _this._internalClosure(function () {
        return new Promise(function (resolve, reject) {
            try {
                _this.deleteObject(object_id).then(function (_unused__delete_ok) {
                    let obj = new os2.StaticLargeObject(_this._container, object_id);
                    let data_stream = new MemoryStream();
                    obj.createFromStream(data_stream, _this._chunkSize).then(function (_unused__obj_ok) {
                        resolve(object_id);
                    }, function (obj_error) {
                        reject(ErrorHelper('setObject Setting new content failed', obj_error));
                    });
                    // End stream
                    data_stream.end(Buffer.from(object_data));
                }, function (delete_error) {
                    reject(ErrorHelper('setObject Removing old content failed', delete_error));
                });
            }
            catch (error) {
                reject(ErrorHelper('setObject Storage update caught error', error));
            }
        });
    });
};

/**
 * @fn deleteObject
 * @param object_id Reference identifier to delete
 * @return {Promise} Resolve to the deleted object ID on success
 */
ObjectStorage.prototype.deleteObject = function (object_id) {
    let _this = this;
    return _this._internalClosure(function () {
        return new Promise(function (resolve, reject) {
            try {
                // Create file in swift
                let obj = new os2.StaticLargeObject(_this._container, object_id);
                // Delete file in swift
                obj.delete().then(function (_unused__ok_delete) {
                    resolve(object_id);
                }, function (delete_error) {
                    reject(ErrorHelper('Delete from storage failed', delete_error));
                });
            }
            catch (error) {
                reject(ErrorHelper(error));
            }
        });
    });
};

/**
 * @fn _generateFilename
 * @desc Wrapper around a name generator, internally based on RFC4122
 * @return {String} A random file name
 * @private
 */
ObjectStorage.prototype._generateFilename = function () {
    return uuid.v4();
};

module.exports = ObjectStorage;
