//External node module imports
const mongodb = require('mongodb').MongoClient;
const express = require('express');
const body_parser = require('body-parser');
const { ErrorHelper, StatusHelper, Constants } =  require('eae-utils');

const MongoHelper = require('./mongoHelper');

const package_json = require('../package.json');
const StatusController = require('./statusController.js');
// const JobsScheduler = require('./jobsScheduler');
// const JobsWatchdog = require('./jobsWatchdog');
const NodesWatchdog = require('./nodesWatchdog');

/**
 * @class EaeScheduler
 * @desc Core class of the scheduler microservice
 * @param config Configurations for the scheduler
 * @constructor
 */
function EaeScheduler(config) {
    // Init member attributes
    this.config = config;
    this.app = express();
    global.eae_scheduler_config = config;
    global.eae_compute_nodes_status = [];
    this.mongo_helper = new MongoHelper();

    // Bind public member functions
    this.start = EaeScheduler.prototype.start.bind(this);
    this.stop = EaeScheduler.prototype.stop.bind(this);

    // Bind private member functions
    this._connectDb = EaeScheduler.prototype._connectDb.bind(this);
    this._setupStatusController = EaeScheduler.prototype._setupStatusController.bind(this);
    this._setupMongoHelper = EaeScheduler.prototype._setupMongoHelper.bind(this);
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
    this.app.use(body_parser.urlencoded({ extended: true }));
    this.app.use(body_parser.json());
}

/**
 * @fn start
 * @desc Starts the eae scheduler service
 * @return {Promise} Resolves to a Express.js Application router on success,
 * rejects an error stack otherwise
 */
EaeScheduler.prototype.start = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
        _this._connectDb().then(function () {
            // Setup route using controllers
            _this._setupStatusController();

            //Setup the mongoHelper
            _this._setupMongoHelper();

            // Setup the monitoring of the nodes' status
            _this._setupNodesWatchdog();

            // Start status periodic update
            _this.status_helper.startPeriodicUpdate(5 * 1000); // Update status every 5 seconds

            // Start the monitoring of the nodes' status
            _this.nodes_watchdog.startPeriodicUpdate(600 * 1000); // Update status every 10 minutes

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
EaeScheduler.prototype._setupStatusController = function () {
    let _this = this;

    let statusOpts = {
        version: package_json.version
    };
    _this.status_helper = new StatusHelper(Constants.EAE_SERVICE_TYPE_SCHEDULER, global.eae_scheduler_config.port, null, statusOpts);
    _this.status_helper.setCollection(_this.db.collection(Constants.EAE_COLLECTION_STATUS));
    _this.status_helper.setStatus(Constants.EAE_SERVICE_STATUS_BUSY);

    _this.statusController = new StatusController(_this.status_helper);
    _this.app.get('/status', _this.statusController.getStatus); // GET status
    _this.app.get('/specs', _this.statusController.getFullStatus); // GET Full status
};

/**
 * @fn _setupMongoHelper
 * @desc Initialize the periodic status update of the compute nodes
 * @private
 */
EaeScheduler.prototype._setupMongoHelper = function () {
    let _this = this;
    _this.mongo_helper.setCollections(_this.db.collection(Constants.EAE_COLLECTION_STATUS),
                                      _this.db.collection(Constants.EAE_COLLECTION_JOBS));
};

/**
 * @fn _setupNodesWatchdog
 * @desc Initialize the periodic monitoring  of the compute nodes
 * @private
 */
EaeScheduler.prototype._setupNodesWatchdog = function () {
    let _this = this;

    _this.nodes_watchdog = new NodesWatchdog(_this.mongo_helper);
};

module.exports = EaeScheduler;
