const request = require('request');
let fs = require('fs');
let config = require('../config/eae.carrier.test.config.js');
let TestServer = require('./testserver.js');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;// 20 seconds

let ts = new TestServer();
let adminUsername = 'admin';

beforeAll(function() {
    return new Promise(function (resolve, reject) {
        ts.run().then(function() {
            ts.createManifests().then(function(){
                ts.createOutputInSwift().then(function() {
                    resolve(true);
                },function(error){
                    reject(error.toString());
                });
            },function (error){
                reject(error.toString());
            });
        }, function (error) {
            reject(error.toString());
        });
    });
});

test('Who Are You?', function(done) {
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

test('Testing Upload Of A File', function(done) {
    expect.assertions(4);

    let options = { method: 'POST',
        url: 'http://127.0.0.1:' + config.port + '/file-upload',
        headers:
            { 'cache-control': 'no-cache',
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
        formData:
            { file:
                { value: fs.createReadStream('test/files/Faust by Johann Wolfgang von Goethe.txt'),
                    options:
                        { filename: 'Faust by Johann Wolfgang von Goethe.txt',
                            contentType: null } },
                jobID: '5a09bbeaa4faust928cbd61a',
                fileName: 'Faust by Johann Wolfgang von Goethe.txt',
                eaeUsername: 'admin'} };

    request(options,
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body).toEqual('true');
            done();
        });
});

test('Testing Download of the Uploaded File', function(done) {
    expect.assertions(3);
    let expectedFileSize = fs.statSync('test/files/Faust by Johann Wolfgang von Goethe.txt').size;
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/file-download',
            json: true,
            body: {
                eaeUsername: adminUsername,
                fileName: 'Faust by Johann Wolfgang von Goethe.txt',
                jobID: '5a09bbea4a8rulesd63a665e'
            }
        }).on('response', function(response) {
        let prom = new Promise(function(resolve, reject) {
            let writable = fs.createWriteStream('file_test.txt');
            let size = 0;
            response.on('data', (chunk) => {
                size += chunk.toString().length;
                writable.write(chunk);
            });
            response.on('end', () => {
                writable.end();
                resolve(writable);
            });
            response.on('error', (error)=>{
                reject(error);
            });
        });
        prom.then(function(writable){
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            writable.on('close', function(){
                let newFileSize = fs.statSync('file_test.txt').size;
                expect(newFileSize).toEqual(expectedFileSize);
                done();
            });
        }, function(error){
            done.fail(error.toString());
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
