//External node module imports
const mongodb = require('mongodb').MongoClient;
const express = require('express');
const body_parser = require('body-parser');
const { ErrorHelper, StatusHelper, Constants } =  require('eae-utils');

const package_json = require('../package.json');
const StatusController = require('./statusController.js');
const JobController = require('./jobController.js');


function EaeCompute(config) {
    this.config = config;
    global.eae_compute_config = config;
    this.app = express();

    //Bind member functions
    this._connectDb = EaeCompute.prototype._connectDb.bind(this);
    this._mongoError = EaeCompute.prototype._mongoError.bind(this);
    this.setupStatusController = EaeCompute.prototype.setupStatusController.bind(this);
    this.setupJobController = EaeCompute.prototype.setupJobController.bind(this);

    //Remove unwanted express headers
    this.app.set('x-powered-by', false);
    //Allow CORS requests when enabled
    if (this.config.enableCors === true) {
        this.app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
    }

    var _this = this;
    this._connectDb().then(function () {
        //Init external middleware
        _this.app.use(body_parser.urlencoded({ extended: true }));
        _this.app.use(body_parser.json());

        //Setup route using controllers
        _this.setupStatusController();
        _this.setupJobController();

    }, function (error) {
        this._mongoError(error);
    });

    return this.app;
}

/**
 * @fn _connectDb
 * @desc Setup the connections with mongoDB
 * @return {Promise} Resolves to true on success
 * @private
 */
EaeCompute.prototype._connectDb = function () {
    var _this = this;
    var main_db = new Promise(function (resolve, reject) {
        mongodb.connect(_this.config.mongoURL, function (err, db) {
            if (err !== null && err !== undefined) {
                reject(ErrorHelper('Failed to connect to mongoDB', err));
                return;
            }
            _this.db = db;
            resolve(true);
        });
    });

	return main_db;
};

/**
 * @fn _mongoError
 * @desc Disables every routes of the app to send back an error message
 * @param message A message string to use in responses
 * @private
 */
EaeCompute.prototype._mongoError = function (message) {
    this.app.all('*', function (req, res) {
        res.status(401);
        res.json(ErrorHelper('Could not connect to the database', message));
    });
};

/**
 * @fn setupStatusController
 * @desc Initialize status service routes and controller
 */
EaeCompute.prototype.setupStatusController = function () {
    var _this = this;

    var statusOpts = {
        version: package_json.version
    };
    _this.status_helper = new StatusHelper('eae-compute', global.eae_compute_config.port, null, statusOpts);
    _this.status_helper.setCollection(_this.db.collection(Constants.EAE_COLLECTION_STATUS));

    _this.statusController = new StatusController(_this.status_helper);
    _this.app.get('/status', _this.statusController.getStatus); //GET status
    _this.app.get('/specs', _this.statusController.getFullStatus); //GET Full status
};

/**
 * @fn setupJobController
 * @desc Initialize job execution service routes and controller
 */
EaeCompute.prototype.setupJobController = function () {
    var _this = this;

    _this.jobController = new JobController(_this.db.collection(Constants.EAE_COLLECTION_JOBS), _this.status_helper);
    _this.app.post('/run', _this.jobController.runJob); //POST run a job from ID
    _this.app.post('/cancel', _this.jobController.cancelJob); //POST cancel current job
};

module.exports = EaeCompute;
