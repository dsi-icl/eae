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

        // Create eae compute server
        _this.eae_compute = new EaeCompute(config);

        // Start server
        _this.eae_compute.start().then(function (compute_router) {
            _this._app.use(compute_router);
            _this._server = _this._app.listen(config.port, function (error) {
                if (error)
                    reject(error);
                else
                    resolve(true);
            });
        }, function (error) {
            reject(error);
        });
    });
};

TestServer.prototype.stop = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        // Remove test flag from env
        delete process.env.TEST;

        _this.eae_compute.stop().then(function() {
            _this._server.close(function(error) {
                    if (error)
                        reject(error);
                    else
                        resolve(true);
                });
            }, function (error) {
                reject(error);
        });
    });
};

TestServer.prototype.mongo = function() {
    return this.eae_compute.db
};

module.exports = TestServer;
