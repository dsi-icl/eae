let express = require('express');
let EaeCarrier = require('../src/eaeCarrier.js');
let config = require('../config/eae.carrier.test.config.js');
const uuidv4 = require('uuid/v4');
const { carrier_models, carrier_constants } = require('../src/models.js');

function TestServer() {
    // Bind member vars
    this._app = express();

    // Bind member functions
    this.run = TestServer.prototype.run.bind(this);
    this.stop = TestServer.prototype.stop.bind(this);
}

TestServer.prototype.run = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        // Setup node env to test during test
        process.env.TEST = 1;
        let oldMongoConfig = config.mongoURL;
        config.mongoURL = oldMongoConfig + uuidv4().toString().replace(/-/g, "");
        // Create eae compute server
        _this.eae_carrier = new EaeCarrier(config);

        // Start server
        _this.eae_carrier.start().then(function (carrier_router) {
            _this._app.use(carrier_router);
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
        setTimeout(_this.eae_carrier.db.dropDatabase().then(function(){
                _this.eae_interface.stop().then(function() {
                    _this._server.close(function(error) {
                        if (error) {
                            reject(error);
                        }else{
                            resolve(true);
                        }});
                })}, function (error) {
                reject(error);
            },function(error){
                reject(error);
            })
            , 5000);
    });
};

TestServer.prototype.createManifests = function(){
    let _this = this;
    return new Promise(function(resolve, reject) {
        let upload = {
            jobId : "5a09bbeaa4faust928cbd61a",
            type : carrier_constants.TRANSFER_TYPE.upload,
            files : [
                'Faust by Johann Wolfgang von Goethe.txt'
            ],
            requester : "admin",
            numberOfTransferredFiles : 0,
            numberOfFilesToTransfer : 1
        };
        let download = {
            jobId : "5a09bbea4a8rulesd63a665e",
            type : carrier_constants.TRANSFER_TYPE.download,
            files : [
                'Faust by Johann Wolfgang von Goethe.txt'
            ],
            requester : "admin",
            numberOfTransferredFiles : 0,
            numberOfFilesToTransfer : 1
        };
        let uploadManifest = Object.assign({}, carrier_models.CARRIER_JOB_MODEL , upload);
        let downloadManifest = Object.assign({}, carrier_models.CARRIER_JOB_MODEL , download);
        _this.eae_carrier.carrierController._carrierCollection.insertMany([uploadManifest,downloadManifest]).then(function () {
            resolve(true);
        }, function (error) {
            reject(error);
        });
    });
};

module.exports = TestServer;
