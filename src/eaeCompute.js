//External node module imports
const mongodb = require('mongodb').MongoClient;
const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const body_parser = require('body-parser');
const ip = require('ip');
const timer = require('timers');

const defines = require('./defines.js');
const package_json = require('../package.json');

function EaeCompute(config) {
    this.config = config;
    this.app = express();

    //Bind member functions
    this._connectDb = EaeCompute.prototype._connectDb.bind(this);
    this._healthHandler = EaeCompute.prototype._healthHandler.bind(this);
    this.setupTotoController = EaeCompute.prototype.setupTotocontroller.bind(this);
   
    //Remove unwanted express headers
    this.app.set('x-powered-by', false);
    //Allow CORS requests when enabled
    if (this.config.enableCors === true) {
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    }

    var _this = this;
    this._connectDb().then(function () {
        //Setup Registry update
        _this._healthHandler();

        //Init external middleware
        _this.app.use(body_parser.urlencoded({ extended: true }));
        _this.app.use(body_parser.json());
       

        //Setup route using controllers
        _this.setupTotoController();

    }, function (error) {
        this.mongoError(error);
    });

    return this.app;
}

/**
 * @fn _healthHandler
 * @desc Setup a routine to update the health status
 * Put a status object in the DB based on this current configuration
 * @private
 */
EaeCompute.prototype._healthHandler = function () {
    var _this = this;

    //Connect to the registry collection
    this.registry = this.db.collection(defines.globalRegistryCollectionName);
    var registry_update = function () {
        //Create status object
        var status = Object.assign({}, defines.registryModel, {
            type: 'borderline-server',
            version: package_json.version,
            timestamp: new Date(),
            expires_in: defines.healthDefaultUpdateInterval / 1000,
            port: _this.config.port,
            ip: ip.address().toString()
        });
        //Write in DB
        //Match by ip + port + type
        //Create if does not exists.
        _this.registry.findOneAndReplace({
            ip: status.ip,
            port: status.port,
            type: status.type
        }, status, { upsert: true, returnOriginal: false })
            .then(function (success) {
                //Nothing to do here
            }, function (error) {
                //Just log the error
                // console.log(error);
            });
    };

    //Call the update every X milliseconds
    var interval_timer = timer.setInterval(registry_update, defines.healthDefaultUpdateInterval);
    //Do a first update now
    registry_update();

    return interval_timer;
};


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
                reject(defines.errorStacker('Failed to connect to mongoDB', err));
                return;
            }
            _this.db = db;
            resolve(true);
        });
    });

	return main_db;
};

/**
 * @fn setupTotoController
 * @desc Initialize users account management routes and controller
 */
EaeCompute.prototype.setupTotoController = function () {
    //Controller imports
   // var totoControllerModule = require('./totoController.js');
   // this.totoController = new totoControllerModule(this.db.collection(defines.totoCollectionName));

	//Register routes
    //this.app.get('/toto', this.totoController.toto); //GET /toto
};

/**
 * @fn mongoError
 * @desc Disables every routes of the app to send back an error message
 * @param message A message string to use in responses
 */
EaeCompute.prototype.mongoError = function (message) {
    this.app.all('*', function (req, res) {
        res.status(401);
        res.json(defines.errorStacker('Could not connect to the database', message));
    });
};

module.exports = EaeCompute;
