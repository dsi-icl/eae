//External node module imports
const mongodb = require('mongodb').MongoClient;
const express = require('express');
const body_parser = require('body-parser');
const { ErrorHelper, StatusHelper, Constants } =  require('eae-utils');

const StatusController = require('./statusController.js');
const package_json = require('../package.json');

function EaeScheduler(config) {
    // Init member attributes
    this.config = config;
    this.app = express();
    global.eae_scheduler_config = config;
    global.eae_compute_nodes_status = [];

    // Bind public member functions
    this.start = EaeScheduler.prototype.start.bind(this);
    this.stop = EaeScheduler.prototype.stop.bind(this);

    // Bind private member functions
    this._connectDb = EaeScheduler.prototype._connectDb.bind(this);
    this._setupStatusController = EaeScheduler.prototype._setupStatusController.bind(this);
    this._setupNodesWatchdog = EaeScheduler.prototype._setupNodesWatchdog.bind(this);
    //this.jobsoller = EaeScheduler.prototype.jobsProcessingController.bind(this);

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
    this.app.use(body_parser.urlencoded({extended: true}));
    this.app.use(body_parser.json());
}

/**
 * @fn start
 * @desc Starts the eae compute service
 * @return {Promise} Resolves to a Express.js Application router on success,
 * rejects an error stack otherwise
 */
EaeScheduler.prototype.start = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
        _this._connectDb().then(function () {
            // Setup route using controllers
            _this._setupStatusController();

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
EaeScheduler.prototype.stop = function() {
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
EaeScheduler.prototype._connectDb = function () {
    var _this = this;
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
 */
EaeScheduler.prototype._setupStatusController = function () {
    let _this = this;

    let statusOpts = {
        version: package_json.version
    };
    _this.status_helper = new StatusHelper(Constants.EAE_SERVICE_TYPE_SC, global.eae_compute_config.port, null, statusOpts);
    _this.status_helper.setCollection(_this.db.collection(Constants.EAE_COLLECTION_STATUS));

    _this.statusController = new StatusController(_this.status_helper);
    _this.app.get('/status', _this.statusController.getStatus); // GET status
    _this.app.get('/specs', _this.statusController.getFullStatus); // GET Full status
};


/**
 * @fn _setupNodesWatchdog
 * @desc Initialize status service routes and controller
 */
EaeScheduler.prototype._setupNodesWatchdog = function () {
    var _this = this;

    _this.status_helper.startPeriodicUpdate(5 * 1000); // Update status every 5 seconds

};

module.exports = EaeScheduler;
