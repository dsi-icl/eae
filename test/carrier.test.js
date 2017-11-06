const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.carrier.test.config.js');
let TestServer = require('./testserver.js');

let ts = new TestServer();
let adminUsername = 'adminUsername';
let adminPassword = 'qwertyUsername';
beforeAll(function() {
    return new Promise(function (resolve, reject) {
        ts.run().then(function() {
                resolve(true);
        }, function (error) {
            reject(error.toString());
        });
    });
});

test('Who are you?', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'GET',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/whoareyou',
            json: true
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(418);
            expect(body).toBeDefined();
            expect(body).toEqual({error:'I\'m a teapot'});
            done();
        }
    );
});


afterAll(function() {
    return new Promise(function (resolve, reject) {
        ts.stop().then(function() {
            resolve(true);
        }, function (error) {
            reject(error.toString());
        });
    });
});
