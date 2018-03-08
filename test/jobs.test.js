const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/opal.interface.test.config.js');
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

test('Get Job Missing Credentials token', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/job',
            json: true,
            body: {
                opalUsername: 'test',
                opalUserToken: null
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(401);
            expect(body).toBeDefined();
            expect(body).toEqual({error:'Missing token'});
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
            uri: '/job',
            json: true,
            body: {
                opalUsername: 'test',
                opalUserToken: 'wrongpassword'
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

test('Create a Job with a nonsupported compute type', function(done) {
    expect.assertions(4);
    let job = JSON.stringify({"type": "python", "main": "hello.py", "params": [], "input": ["input1.txt", "input2.txt"]});
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/job/create',
            json: true,
            body: {
                opalUserToken: adminPassword,
                job: job
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(405);
            expect(body).toBeDefined();
            expect(body).toEqual({error:'The requested compute type is currently not supported. The list of supported computations: ' +
                            eaeutils.Constants.EAE_COMPUTE_TYPE_PYTHON2 + ', ' + eaeutils.Constants.EAE_COMPUTE_TYPE_SPARK + ', ' +
                            eaeutils.Constants.EAE_COMPUTE_TYPE_R + ', ' + eaeutils.Constants.EAE_COMPUTE_TYPE_TENSORFLOW});
            done();
        }
    );
});


test('Create a Job and subsequently get it', function(done) {
    expect.assertions(14);
    let job = JSON.stringify({"type": eaeutils.Constants.EAE_COMPUTE_TYPE_PYTHON2, "main": "hello.py", "params": [], "input": ["input1.txt", "input2.txt"]});
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/job/create',
            json: true,
            body: {
                opalUsername: adminUsername,
                opalUserToken: adminPassword,
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
                    uri: '/job',
                    json: true,
                    body: {
                        opalUsername: adminUsername,
                        opalUserToken: adminPassword,
                        jobID: body.jobID
                    }
                }, function(error, response, body) {
                    if (error) {
                        done.fail(error.toString());
                    }
                    expect(response).toBeDefined();
                    expect(response.statusCode).toEqual(200);
                    expect(body).toBeDefined();
                    expect(body.type).toEqual(eaeutils.Constants.EAE_COMPUTE_TYPE_PYTHON2);
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

test('Create a Job and subsequently cancel it', function(done) {
    expect.assertions(10);
    let job = JSON.stringify({"type": eaeutils.Constants.EAE_COMPUTE_TYPE_PYTHON2, "main": "hello.py", "params": [], "input": ["input1.txt", "input2.txt"]});
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/job/create',
            json: true,
            body: {
                opalUsername: adminUsername,
                opalUserToken: adminPassword,
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
            let jobID = body.jobID;
            request(
                {
                    method: 'POST',
                    baseUrl: 'http://127.0.0.1:' + config.port,
                    uri: '/job/cancel',
                    json: true,
                    body: {
                        opalUsername: adminUsername,
                        opalUserToken: adminPassword,
                        jobID: jobID
                    }
                }, function(error, response, body) {
                    if (error) {
                        done.fail(error.toString());
                    }
                    expect(response).toBeDefined();
                    expect(response.statusCode).toEqual(200);
                    expect(body).toBeDefined();
                    expect(body.status).toEqual('Job ' + jobID + ' has been successfully cancelled.');
                    expect(body.cancelledJob.status).toEqual([eaeutils.Constants.EAE_JOB_STATUS_CANCELLED, eaeutils.Constants.EAE_JOB_STATUS_QUEUED, eaeutils.Constants.EAE_JOB_STATUS_TRANSFERRING_DATA, eaeutils.Constants.EAE_JOB_STATUS_CREATED]);
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
