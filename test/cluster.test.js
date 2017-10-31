const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.interface.config.js');
let TestServer = require('./testserver.js');

let ts = new TestServer();
beforeAll(function() {
    return new Promise(function (resolve, reject) {
        ts.run().then(function() {
            resolve(true);
        }, function (error) {
            reject(error.toString());
        });
    });
});
