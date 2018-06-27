//External node module imports
const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb').MongoClient;
const { ErrorHelper, StatusHelper, Constants } = require('eae-utils');

const package_json = require('../package.json');
const StatusController = require('./controllers/statusController.js');
const JobsControllerModule = require('./controllers/jobsController.js');
const UsersControllerModule = require('./controllers/usersController.js');
const ClusterControllerModule = require('./controllers/clusterController.js');
const AccessLogger = require('./core/accessLogger.js');

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
    global.eae_interface_config = config;

    // Bind public member functions
    this.start = EaeInterface.prototype.start.bind(this);
    this.stop = EaeInterface.prototype.stop.bind(this);

    // Bind private member functions
    this._connectDb = EaeInterface.prototype._connectDb.bind(this);
    this._setupStatusController = EaeInterface.prototype._setupStatusController.bind(this);
    this._setupInterfaceControllers = EaeInterface.prototype._setupInterfaceControllers.bind(this);

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
 * @desc Starts the eae interface service
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
            _this._setupInterfaceControllers();

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
 * @desc Stop the eae interface service
 * @return {Promise} Resolves to a Express.js Application router on success,
 * rejects an error stack otherwise
 */
EaeInterface.prototype.stop = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
        // Stop status update
        _this.status_helper.stopPeriodicUpdate();
        // Disconnect DB --force
        _this.client.close(true).then(function(error) {
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
        mongodb.connect(_this.config.mongoURL, {}, function (err, client) {
            if (err !== null && err !== undefined) {
                reject(ErrorHelper('Failed to connect to mongoDB', err));
                return;
            }
            _this.client = client;
            _this.db = _this.client.db();
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
    _this.status_helper = new StatusHelper(Constants.EAE_SERVICE_TYPE_API, global.eae_interface_config.port, null, statusOpts);
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
EaeInterface.prototype._setupInterfaceControllers = function() {
    let _this = this;

    _this.accessLogger = new AccessLogger(_this.db.collection(Constants.EAE_COLLECTION_ACCESS_LOG));
    _this.jobsController = new JobsControllerModule(_this.config.carriers,
                                                    _this.db.collection(Constants.EAE_COLLECTION_JOBS),
                                                    _this.db.collection(Constants.EAE_COLLECTION_USERS),
                                                    _this.db.collection(Constants.EAE_COLLECTION_CARRIER),
                                                    _this.accessLogger);
    _this.usersController = new UsersControllerModule(_this.db.collection(Constants.EAE_COLLECTION_USERS),
                                                      _this.accessLogger);
    _this.clusterController = new ClusterControllerModule(_this.db.collection(Constants.EAE_COLLECTION_STATUS),
                                                          _this.db.collection(Constants.EAE_COLLECTION_USERS),
                                                          _this.accessLogger);

    // Retrieve a specific job - Check that user requesting is owner of the job or Admin
    _this.app.post('/job', _this.jobsController.getJob);

    // Retrieve all current jobs - Admin only
    _this.app.post('/job/getAll', _this.jobsController.getAllJobs);

    // Create a job request with data transfer through the carrier
    _this.app.post('/job/create', _this.jobsController.createNewJob);

    // Create a job request without data transfer pulling from swift directly
    _this.app.post('/job/create/swift', _this.jobsController.createNewJobSwift);

    // Cancel a Job
    _this.app.post('/job/cancel', _this.jobsController.cancelJob);

    // Retrieve the results for a specific job
    _this.app.post('/job/results', _this.jobsController.getJobResults);

    // Retrieve the results for a specific job that was a using swift directly
    _this.app.post('/job/results/swift', _this.jobsController.getJobResultsSwift);

    // Status of the services in the eAE - Admin only
    _this.app.post('/servicesStatus', _this.clusterController.getServicesStatus);

    // Sends back a list of available carriers for data transfer
    // _this.app.get('/carriers', _this.carrierController.getCarriers);

    // Manage the users who have access to the platform - Admin only
    _this.app.post('/user/', _this.usersController.getUser)
        .post('/user/create', _this.usersController.createUser)
        .post('/user/getAll', _this.usersController.getAllUsers)
        .delete('/user/delete', _this.usersController.deleteUser);

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


module.exports = EaeInterface;
