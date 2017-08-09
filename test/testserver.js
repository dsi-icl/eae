let express = require('express');
let EaeCompute = require('../src/eaeCompute.js');
let config = require('../config/eae.compute.test.config.js');
const mongodb = require('mongodb').MongoClient;

function TestServer() {
    // Bind member vars
    this._app = express();

    // Bind member functions
    this.run = TestServer.prototype.run.bind(this);
    this.stop = TestServer.prototype.stop.bind(this);
    this.mongo = TestServer.prototype.mongo.bind(this);
}

TestServer.prototype.run = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        // Setup node env to test during test
        process.env.TEST = 1;

        // Plugs eae compute routes
        _this.eae_compute = new EaeCompute(config);
        _this._app.use(_this.eae_compute);

        // Serves eae compute
        _this._app.listen(config.port, function(error) {
            if (error)
                reject(error);
        });

        mongodb.connect(config.mongoURL, function(error, db) {
            if (error)
                reject(error);
            else {
                _this.db = db;
                resolve(true);
            }
        });
    });
};

TestServer.prototype.stop = function() {
    let _this = this;
    return new Promise(function(resolve, __unused__reject) {
        // Remove test flag from env
        delete process.env.TEST;

        _this.db.close();
        delete _this.eae_compute;

        resolve(true);
    });
};

TestServer.prototype.mongo = function() {
    return this.db;
};

module.exports = TestServer;
