//External node module imports
const mongodb = require('mongodb').MongoClient;
const express = require('express');
const body_parser = require('body-parser');
const { ErrorHelper, StatusHelper, Constants } =  require('eae-utils');

const package_json = require('../package.json');

function EaeScheduler(config) {
    this.config = config;
    global.eae_compute_config = config;
    this.app = express();

    //Bind member functions
    this._connectDb = EaeScheduler.prototype._connectDb.bind(this);
    this._mongoError = EaeScheduler.prototype._mongoError.bind(this);
    this.setupStatusController = EaeScheduler.prototype.setupStatusController.bind(this);
    this.setupJobController = EaeScheduler.prototype.setupJobController.bind(this);

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

    var _this = this;
    this._connectDb().then(function () {
        //Init external middleware
        _this.app.use(body_parser.urlencoded({ extended: true }));
        _this.app.use(body_parser.json());

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
EaeScheduler.prototype._connectDb = function () {
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
EaeScheduler.prototype._mongoError = function (message) {
    this.app.all('*', function (_unused__req, res) {
        res.status(401);
        res.json(ErrorHelper('Could not connect to the database', message));
    });
};

module.exports = EaeScheduler;
