const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.carrier.test.config.js');
let TestServer = require('./testserver.js');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;// 20 seconds

let ts = new TestServer();
let adminUsername = 'admin';
let adminPassword = 'qwerty1234';
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

test('testing download', function(done) {
    expect.assertions(3);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/file-download',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                fileName: 'large_test.vcf',
                jobID: '5a09bbea4a928cbd613a665e'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            if(response.statusCode.valueOf() === 500 || response.statusCode.valueOf() === 401){
                done.fail(body.error.toString());
            }
            let fs = require('fs');  // file system
            let prom = new Promise(function(resolve, reject) {
                let writable = fs.createWriteStream('toto.txt');
                response.on('data', (chunk) => {
                    // console.log(Buffer.isBuffer(chunk));
                    writable.write(chunk);
                });
                response.on('end', () => {
                    resolve(writable.end('Goodbye\n'));
                });
                response.on('error', (error)=>{
                    reject(error);
                });
            });
            prom.then(function(){
                expect(response).toBeDefined();
                expect(response.statusCode).toEqual(200);
                expect(body).toBeDefined();
                done();
            }, function(error){
                done.fail(console.log(error));
            });
        });
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
