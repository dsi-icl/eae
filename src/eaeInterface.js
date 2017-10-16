//External node module imports
const express = require('express');
const body_parser = require('body-parser');
const multer = require('multer');
const { ErrorHelper, StatusHelper, Constants } = require('eae-utils');

const package_json = require('../package.json');
const StatusController = require('./statusController.js');

/**
 * @class EaeInterface
 * @desc Core class of the interface micro service
 * @param config Configurations for the interface
 * @constructor
 */
function EaeInterface(config) {
    // Init member attributes
    this.config = config;
    this.app = express();

    // Bind public member functions
    this.start = EaeInterface.prototype.start.bind(this);
    this.stop = EaeInterface.prototype.stop.bind(this);

    // Bind private member functions
    this._connectDb = EaeInterface.prototype._connectDb.bind(this);
    this._setupStatusController = EaeInterface.prototype._setupStatusController.bind(this);
    this._setupInterfaceController = EaeInterface.prototype._setupInterfaceController.bind(this);

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
EaeInterface.prototype.start = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
        _this._connectDb().then(function () {
            // Setup route using controllers
            _this._setupStatusController();

            // Setup interface controller
            _this._setupInterfaceController();

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
EaeInterface.prototype.stop = function() {
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
EaeInterface.prototype._connectDb = function () {
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
EaeInterface.prototype._setupStatusController = function () {
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
 * @fn _setupInterfaceController
 * @desc Initialize the interface service routes and controller
 * @private
 */
EaeInterface.prototype._setupInterfaceController = function() {
    let _this = this;

    // Create a job request
    _this.app.post('/job', _this.interfaceController.postNewJob);

    // Retrieve a specific job - Check that user requesting is owner of the job
    _this.app.get('/job/:job_id', _this.interfaceController.getJob);

    // Retrieve all current jobs - Admin only
    _this.app.get('/allJobs', _this.interfaceController.getAllJobs);

    // Status of the services in the eAE - Admin only
    _this.app.get('/servicesStatus', _this.clusterController.getServicesStatus);

    // Sends back a list of available carriers for data transfer
    _this.app.get('', _this.carrierController.getCarriers);

    // :)
    _this.app.all('/whoareyou', function (__unused__req, res) {
        res.status(418);
        res.json(ErrorHelper('I\'m a teapot'));
    });

    // We take care of all remaining routes
    _this.app.all('/*', function (__unused__req, res) {
        res.status(400);
        res.json(ErrorHelper('Bad request'));
    });
};


module.exports = EaeInterface;
