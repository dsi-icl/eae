const Minio = require('minio');
const { ErrorHelper } = require('eae-utils');
const uuid = require('uuid');

/**
 * @fn MinIOStorage
 * @param options[in] A Plain JS object describing the minio object storage endpoint
 * @param jobID Id of the associated job. It defines the first half of the minio bucket name.
 * @param type One of two possible values is input or output. it defines the second half og the minio container name.
 * @constructor
 */
function MinIOStorage(
    options = {
        minIOHost: 'http://127.0.0.1',
        minIOPort: '9000',
        accessKey: 'minioadmin',
        secretKey: 'minioadmin',
        bucketRegion: 'region',
        useSSL: false
    }, jobID, type) {
    this._host = options.minIOHost;
    this._port = options.minIOPort;
    this._accessKey = options.accessKey;
    this._secretKey = options.secretKey;
    this._bucketRegion = options.bucketRegion;
    this._useSSL = options.useSSL;
    this._bucketName = jobID + '_' + type;

    // Bind public member functions
    this.createObject = MinIOStorage.prototype.createObject.bind(this);
    this.getObject = MinIOStorage.prototype.getObject.bind(this);

    // Bind Private methods
    this._internalClosure = MinIOStorage.prototype._internalClosure.bind(this);
    this._generateFilename = MinIOStorage.prototype._generateFilename.bind(this);
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
MinIOStorage.prototype._internalClosure = function (callback, ...args) {
    let _this = this;

    let _connect_check = function () {
        return new Promise(function (resolve, reject) {
            _this._client = new Minio.Client({
                endPoint: _this._host,
                port: _this._port,
                useSSL: _this._useSSL,
                accessKey: _this._accessKey,
                secretKey: _this._secretKey
            }).then(function (connected){
                resolve(connected);
            }, function (error){
                reject(ErrorHelper('Failed to connect', error));
            });
        });
    };

    let _bucket_check = function () {
        return new Promise(function (resolve, reject) {
            const bucketExists = _this._client.bucketExists(_this._bucketName);
            if (!bucketExists) {
                _this.client.makeBucket(_this._bucketName, _this._bucketRegion ?? '').then(function (create_ok){
                    resolve(create_ok);
                }, function (error){
                    reject(ErrorHelper('Failed to create bucket', error));
                });
            }
        });
    };

    return _connect_check().then(function (_unused___connect_ok) {
            return _bucket_check().then(function (_unused__container_ok) {
                return callback.apply(_this, args);
            }, function (bucket_error) {
                return Promise.reject(ErrorHelper('Bucket check failed', bucket_error));
            });
        }, function (connect_error) {
            return Promise.reject(ErrorHelper('Connect check failed', connect_error));
        }
    );
};


/**
 * @fn createObject
 * @param object_data String or Buffer data to store in a new object
 * @param fileName The name of the file to be inserted into Swift
 * @return {Promise} Resolves to object id on success
 */
MinIOStorage.prototype.createObject = function (object_data, fileName) {
    let _this = this;
    return _this._internalClosure(function () {
        return new Promise(function (resolve, reject) {
            let objName = fileName || _this._generateFilename();
            let fileExists;
            try {
                this._client.statObject(_this._bucketName, objName);
                fileExists = true;
            } catch (e) {
                fileExists = false;
            }
            if (fileExists) {
                throw new Error(`File "${fileName}" in bucket "${_this._bucketName}" already exists.`);
            }
            _this._client.putObject(_this._bucketName, objName, object_data).then(function(_unused__obj_ok){
                resolve(objName);
            }, function (obj_error){
                reject(ErrorHelper('Creating new entry in object store failed', obj_error));
            });
        });
    });
};


/**
 * @fn getObject
 * @param object_id Reference identifier for the data
 * @return {Promise} Resolves to the data content into a String
 */
MinIOStorage.prototype.getObject = function (object_id) {
    let _this = this;
    return _this._internalClosure(function () {
        return new Promise(function (resolve, reject) {
            try {
                // Open file in swift
                _this._client.getObject(_this._bucketName, object_id).then(function (readable) {
                    resolve(readable);
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
 * @fn _generateFilename
 * @desc Wrapper around a name generator, internally based on RFC4122
 * @return {String} A random file name
 * @private
 */
MinIOStorage.prototype._generateFilename = function () {
    return uuid.v4();
};

module.exports = MinIOStorage;
