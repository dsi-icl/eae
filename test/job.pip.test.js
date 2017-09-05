const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.compute.config.js');
let TestServer = require('./testserver.js');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // 20 seconds


let ts = new TestServer();
let g_job = null;

beforeAll(function() {
    return new Promise(function (resolve, reject) {
        ts.run().then(function() {
            resolve(true);
        }, function (error) {
            reject(error.toString());
        });
    });
});

test('Create pip install pymongo job & start running', function(done) {
    expect.assertions(6);
    ts.createJob(eaeutils.Constants.EAE_JOB_TYPE_PIP,
        '', ['install', 'pymongo'], [ ]).then(function(job_model) {
        expect(job_model).toBeDefined();
        expect(job_model.type).toEqual(eaeutils.Constants.EAE_JOB_TYPE_PIP);
        job_model.input = [];
        job_model.output = [];
        g_job = job_model;
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

test('Wait for compute to go idle', function(done) {
    expect.assertions(3);
    setTimeout(function() {
        request(
            {
                method: 'GET',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/status',
                json: true
            },
            function(error, response, body) {
                if (error) {
                    done.fail(error.toString());
                }
                expect(response).toBeDefined();
                expect(response.statusCode).toEqual(200);
                expect(body.status).toEqual(eaeutils.Constants.EAE_SERVICE_STATUS_IDLE);
                done();
            }
        );
    }, 10000); // 10 seconds
});

test('Delete pip install job', function(done) {
    expect.assertions(1);
    ts.deleteJob(g_job).then(function(result) {
        expect(result).toBeTruthy();
        g_job = null;
        done();
    }, function(error) {
        done.fail(error.toString());
    });
});

test('Create pymongo job & start running', function(done) {
    expect.assertions(6);
    ts.createJob(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2,
        './input/pymongo.py', [], [ './test/jobs/pymongo/pymongo.py' ]).then(function(job_model) {
        expect(job_model).toBeDefined();
        expect(job_model.type).toEqual(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2);
        g_job = job_model;
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

test('Wait for compute to go idle', function(done) {
    expect.assertions(3);
    setTimeout(function() {
        request(
            {
                method: 'GET',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/status',
                json: true
            },
            function(error, response, body) {
                if (error) {
                    done.fail(error.toString());
                }
                expect(response).toBeDefined();
                expect(response.statusCode).toEqual(200);
                expect(body.status).toEqual(eaeutils.Constants.EAE_SERVICE_STATUS_IDLE);
                done();
            }
        );
    }, 5000); // 5 seconds
});

test('Delete pymongo job', function(done) {
    expect.assertions(1);
    ts.deleteJob(g_job).then(function(result) {
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
