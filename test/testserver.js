let express = require('express');
let EaeCompute = require('../src/eaeCompute.js');
let config = require('../config/eae.compute.test.config.js');
let ObjectID = require('mongodb').ObjectID;
const request = require('request');
const fs = require('fs');
const path = require('path');
const eaeutils = require('eae-utils');

function TestServer() {
    // Bind member vars
    this._app = express();

    this._swift = new eaeutils.SwiftHelper({
        url: config.swiftURL,
        username: config.swiftUsername,
        password: config.swiftPassword
    });

    // Bind member functions
    this.run = TestServer.prototype.run.bind(this);
    this.stop = TestServer.prototype.stop.bind(this);
    this.mongo = TestServer.prototype.mongo.bind(this);
    this.createJob = TestServer.prototype.createJob.bind(this);
    this.deleteJob = TestServer.prototype.deleteJob.bind(this);
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
                else {
                    resolve(true);
                }
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

TestServer.prototype.createJob = function(type, mainScript, inputFiles = []) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        let job_id = new ObjectID();
        let input_container = job_id.toHexString() + '_input';
        let job_model = Object.assign({},
            eaeutils.DataModels.EAE_JOB_MODEL,
            {
                _id: job_id,
                type: type,
                main: mainScript,
                input: inputFiles.map(function (file) {
                    return path.basename(file)
                })
            }
        );
        // Insert in DB
        _this.eae_compute.jobController._jobCollection.insertOne(job_model).then(function() {
            // Upload files
            let upload_promises = [];
            // Create this job input container
            _this._swift.createContainer(input_container).then(function() {
                // Create each file
                inputFiles.forEach(function (file) {
                    let rs = fs.createReadStream(file);
                    if (rs === undefined) {
                        reject(eaeutils.ErrorHelper(file + ' does not exists'));
                        return;
                    }
                    let up = _this._swift.createFile(input_container, path.basename(file), rs);
                    upload_promises.push(up);
                });
                Promise.all(upload_promises).then(function() {
                    resolve(job_model);
                }, function(error) {
                    reject(error);
                });
            }, function(error) {
                reject(error);
            });
        }, function(error) {
            reject(error);
        });
    });
};

TestServer.prototype.deleteJob = function(job_model) {
    let _this = this;
    return new Promise(function(resolve, reject) {
        let input_container = job_model._id.toHexString() + '_input';
        let output_container = job_model._id.toHexString() + '_output';
        let delete_promises = [];
        // Delete input files
        job_model.input.forEach(function (file) {
            let dp = _this._swift.deleteFile(input_container, file);
            delete_promises.push(dp);
        });
        // Delete output files
        job_model.input.forEach(function (file) {
            let dp = _this._swift.deleteFile(output_container, file);
            delete_promises.push(dp);
        });
        // Wait all files deletes
        Promise.all(delete_promises).then(function() {
            // Wait for all containers delete
            Promise.all([_this._swift.deleteContainer(input_container), _this._swift.deleteContainer(output_container)]).then(function() {
                // Remove from DB
                _this.eae_compute.jobController._jobCollection.deleteOne({_id : job_model._id}).then(function() {
                    resolve(true);
                }, function(error) {
                    reject(error);
                });
            }, function(error) {
                reject(error);
            });
        }, function(error) {
            reject(error);
        });
    });
};

module.exports = TestServer;
