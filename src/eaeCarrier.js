//External node module imports
const mongodb = require('mongodb').MongoClient;
const express = require('express');
const body_parser = require('body-parser');
const multer = require('multer');
const { ErrorHelper, StatusHelper, SwiftHelper, Constants } = require('eae-utils');

const package_json = require('../package.json');
const StatusController = require('./statusController.js');
const CarrierController = require('./carrierController');
const FileCarrier = require('./fileCarrier.js');

/**
 * @class EaeCarrier
 * @desc Core class of the carrier micro service
 * @param config Configurations for the carrier
 * @constructor
 */
function EaeCarrier(config) {
    // Init member attributes
    this.config = config;
    this.app = express();
    global.eae_carrier_config = config;

    // Bind public member functions
    this.start = EaeCarrier.prototype.start.bind(this);
    this.stop = EaeCarrier.prototype.stop.bind(this);

    // Bind private member functions
    this._connectDb = EaeCarrier.prototype._connectDb.bind(this);
    this._setupStatusController = EaeCarrier.prototype._setupStatusController.bind(this);
    this._setupCarrierController = EaeCarrier.prototype._setupCarrierController.bind(this);
    this._setupFileCarrier = EaeCarrier.prototype._setupFileCarrier.bind(this);
    this._setupSwiftHelper = EaeCarrier.prototype._setupSwiftHelper.bind(this);

    //Remove unwanted express headers
    this.app.set('x-powered-by', false);

    //Allow CORS requests when enabled
    if (this.config.enableCors === true) {
        this.app.use(function (_unused__req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
    }

    // Init third party middleware
    this.app.use(body_parser.urlencoded({ extended: true }));
    this.app.use(body_parser.json());
}

/**
 * @fn start
 * @desc Starts the eae scheduler service
 * @return {Promise} Resolves to a Express.js Application router on success,
 * rejects an error stack otherwise
 */
EaeCarrier.prototype.start = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
        _this._connectDb().then(function () {
            // Setup route using controllers
            _this._setupStatusController();

            // Setup the helper
            _this._setupSwiftHelper();

            // Setup the file carrier
            _this._setupCarrierController();
            _this._setupFileCarrier();

            // Start status periodic update
            _this.status_helper.startPeriodicUpdate(5 * 1000); // Update status every 5 seconds

            resolve(_this.app); // All good, returns application
        }, function (error) {
            reject(ErrorHelper('Cannot establish mongoDB connection', error));
        });
    });
};

/**
 * @fn stop
 * @desc Stop the eae compute service
 * @return {Promise} Resolves to a Express.js Application router on success,
 * rejects an error stack otherwise
 */
EaeCarrier.prototype.stop = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
        // Stop status update
        _this.status_helper.stopPeriodicUpdate();
        // Disconnect DB --force
        _this.db.close(true).then(function(error) {
            if (error)
                reject(ErrorHelper('Closing mongoDB connection failed', error));
            else
                resolve(true);
        });
    });
};

/**
 * @fn _connectDb
 * @desc Setup the connections with mongoDB
 * @return {Promise} Resolves to true on success
 * @private
 */
EaeCarrier.prototype._connectDb = function () {
    let _this = this;
    return new Promise(function (resolve, reject) {
        mongodb.connect(_this.config.mongoURL, function (err, db) {
            if (err !== null && err !== undefined) {
                reject(ErrorHelper('Failed to connect to mongoDB', err));
                return;
            }
            _this.db = db;
            resolve(true);
        });
    });
};

/**
 * @fn _setupStatusController
 * @desc Initialize status service routes and controller
 * @private
 */
EaeCarrier.prototype._setupStatusController = function () {
    let _this = this;

    let statusOpts = {
        version: package_json.version
    };
    _this.status_helper = new StatusHelper(Constants.EAE_SERVICE_TYPE_CARRIER, global.eae_carrier_config, null, statusOpts);
    _this.status_helper.setCollection(_this.db.collection(Constants.EAE_COLLECTION_STATUS));

    _this.statusController = new StatusController(_this.status_helper);
    _this.app.get('/status', _this.statusController.getStatus); // GET status
    _this.app.get('/specs', _this.statusController.getFullStatus); // GET Full status
};

/**
 * @fn _setupSwiftHelper
 * @desc Initialize the helper class to interact with Swift
 * @private
 */
EaeCarrier.prototype._setupSwiftHelper = function () {
    let _this = this;
    _this.swift_storage = new SwiftHelper({
        url: _this.config.swiftURL,
        username: _this.config.swiftUsername,
        password: _this.config.swiftPassword
    });
};

/**
 * @fn _setupCarrierController
 * @desc Initialize the file carrier controller
 * @private
 */
EaeCarrier.prototype._setupCarrierController = function(){
    let _this = this;
    _this.carrierController = new CarrierController();
    _this.carrierController.setCollection(_this.db.collection(Constants.EAE_COLLECTION_CARRIER));
};

/**
 * @fn _setupFileCarrier
 * @desc Initialize the file carrier that while put the files into swift
 * @private
 */
EaeCarrier.prototype._setupFileCarrier = function(){
    let _this = this;
    _this.fileCarrier = new FileCarrier(_this.swift_storage);
    _this.carrierController.setFileCarrier(_this.fileCarrier);

    // We set up the routes for the file upload
    _this.app.route('/file' + '/:input_id')
        .post(multer().single('file'), _this.carrierController.executeUpload);

    // :)
    _this.app.all('/whoareyou', function (_unused__req, res) {
        res.status(418);
        res.json(ErrorHelper('I\'m a teapot'));
    });

    // We take care of all remaining routes
    _this.app.all('/*', function (_unused__req, res) {
        res.status(400);
        res.json(ErrorHelper('Bad request'));
    });
};



module.exports = EaeCarrier;
