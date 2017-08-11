const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.compute.test.config.js');
let TestServer = require('./testserver.js');

let ts = new TestServer();
let job = null;

beforeAll(function() {
    return new Promise(function (resolve, reject) {
        ts.run().then(function() {
            resolve(true);
        }, function (error) {
            reject(error.toString());
        });
    });
});

test('Create pip job & start running', function(done) {
    expect.assertions(6);
    ts.createJob(eaeutils.Constants.EAE_JOB_TYPE_PIP,
        '', ['install', 'pymongo'], [ ]).then(function(job_model) {
        expect(job_model).toBeDefined();
        expect(job_model.type).toEqual(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2);
        job = job_model;
        request(
            {
                method: 'POST',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/run',
                json: true,
                body: {
                    job_id: job_model._id.toHexString()
                }
            },
            function(error, response, body) {
                if (error) {
                    done.fail(error.toString());
                    return;
                }
                expect(response).toBeDefined();
                expect(response.statusCode).toEqual(200);
                expect(body).toBeDefined();
                expect(body.status).toEqual(eaeutils.Constants.EAE_JOB_STATUS_RUNNING);
                done(); // All good !
            }
        );
    }, function(error) {
       done.fail(error.toString());
    });
});

test('Wait for compute to go idle or dead', function(done) {
    expect.assertions(1);
    var t = setInterval(function() {
        request(
            {
                method: 'GET',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/status',
                json: true
            },
            function(error, response, body) {
                if (error) {
                    clearInterval(t);
                    done.fail(error.toString());
                }
                if (body && body.status &&
                    (
                        body.status === eaeutils.Constants.EAE_SERVICE_STATUS_IDLE ||
                        body.status === eaeutils.Constants.EAE_SERVICE_STATUS_DEAD)) {
                    expect(response.statusCode).toEqual(200);
                    clearInterval(t);
                    done();
                }
            }
        );
    }, 300); // Every 300 ms
});

test('Create pymongo job & start running', function(done) {
    expect.assertions(6);
    ts.createJob(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2,
        './input/pymongo.py', [], [ './test/jobs/pymongo/pymongo.py' ]).then(function(job_model) {
        expect(job_model).toBeDefined();
        expect(job_model.type).toEqual(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2);
        job_model.output = [ ]; //Manually insert expected output files
        job = job_model;
        request(
            {
                method: 'POST',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/run',
                json: true,
                body: {
                    job_id: job_model._id.toHexString()
                }
            },
            function(error, response, body) {
                if (error) {
                    done.fail(error.toString());
                    return;
                }
                expect(response).toBeDefined();
                expect(response.statusCode).toEqual(200);
                expect(body).toBeDefined();
                expect(body.status).toEqual(eaeutils.Constants.EAE_JOB_STATUS_RUNNING);
                done(); // All good !
            }
        );
    }, function(error) {
        done.fail(error.toString());
    });
});

test('Wait for compute to go idle or dead', function(done) {
    expect.assertions(1);
    var t = setInterval(function() {
        request(
            {
                method: 'GET',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/status',
                json: true
            },
            function(error, response, body) {
                if (error) {
                    clearInterval(t);
                    done.fail(error.toString());
                }
                if (body && body.status &&
                    (
                        body.status === eaeutils.Constants.EAE_SERVICE_STATUS_IDLE ||
                        body.status === eaeutils.Constants.EAE_SERVICE_STATUS_DEAD)) {
                    expect(response.statusCode).toEqual(200);
                    clearInterval(t);
                    done();
                }
            }
        );
    }, 300); // Every 300 ms
});

test('Delete pymongo job', function(done) {
    expect.assertions(1);
    ts.deleteJob(job).then(function(result) {
        expect(result).toBeTruthy();
        done();
    }, function(error) {
        done.fail(error.toString());
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
