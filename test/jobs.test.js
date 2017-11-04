const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.interface.test.config.js');
let TestServer = require('./testserver.js');

let ts = new TestServer();
let adminUsername = 'adminUsername';
let adminPassword = 'qwertyUsername';
beforeAll(function() {
    return new Promise(function (resolve, reject) {
        ts.run().then(function() {
            ts.addAdminUser(adminUsername, adminPassword).then(function(){
                resolve(true);
            },function(insertError){
                reject(insertError);
            });
        }, function (error) {
            reject(error.toString());
        });
    });
});

test('Get Job Missing Credentials Username', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/getjob',
            json: true,
            body: {
                eaeUsername: null,
                eaeUserToken: 'wrongpassword'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(401);
            expect(body).toBeDefined();
            expect(body).toEqual({error:'Missing username or token'});
            done();
        }
    );
});

test('Get Job Missing Credentials token', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/getjob',
            json: true,
            body: {
                eaeUsername: 'test',
                eaeUserToken: null
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(401);
            expect(body).toBeDefined();
            expect(body).toEqual({error:'Missing username or token'});
            done();
        }
    );
});

test('Get Job No jobID', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/getjob',
            json: true,
            body: {
                eaeUsername: 'test',
                eaeUserToken: 'wrongpassword'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(401);
            expect(body).toBeDefined();
            expect(body).toEqual({error:'The job request do not exit. The query has been logged.'});
            done();
        }
    );
});

test('Create a Job and subsequently get it', function(done) {
    expect.assertions(14);
    let job = JSON.stringify({"type": "python", "main": "hello.py", "params": [], "input": ["input1.txt", "input2.txt"]});
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/createjob',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                job: job
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.status).toEqual('OK');
            expect(body.jobID).toBeDefined();
            request(
                {
                    method: 'POST',
                    baseUrl: 'http://127.0.0.1:' + config.port,
                    uri: '/getjob',
                    json: true,
                    body: {
                        eaeUsername: adminUsername,
                        eaeUserToken: adminPassword,
                        jobID: body.jobID
                    }
                }, function(error, response, body) {
                    if (error) {
                        done.fail(error.toString());
                    }
                    expect(response).toBeDefined();
                    expect(response.statusCode).toEqual(200);
                    expect(body).toBeDefined();
                    expect(body.type).toEqual('python');
                    expect(body.requester).toEqual(adminUsername);
                    expect(body.main).toEqual('hello.py');
                    expect(body.statusLock).toEqual(false);
                    expect(body.exitCode).toEqual(-1);
                    expect(body.input).toEqual([ 'input1.txt', 'input2.txt' ]);
                    done();
                });
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
