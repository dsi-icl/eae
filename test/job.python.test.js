const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.compute.config.js');
let TestServer = require('./testserver.js');

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

test('Create dummy job & start running', function(done) {
    expect.assertions(6);
    ts.createJob(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2,
        './input/dummy.py', [], [ './test/jobs/dummy/dummy.py' ]).then(function(job_model) {
        expect(job_model).toBeDefined();
        expect(job_model.type).toEqual(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2);
        job_model.output = [ "test.txt" ]; //Manually insert expected output files
        g_job = Object.assign({}, job_model);
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
    let t = setInterval(function() {
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

test('Check dummy output result and delete job', function(done) {
    expect.assertions(1);
    ts.deleteJob(g_job).then(function(result) {
        expect(result).toBeTruthy();
        g_job = null;
        done();
    }, function(error) {
        done.fail(error.toString());
    });
});

test('Create timer job & start running', function(done) {
    expect.assertions(6);
    ts.createJob(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2,
        './input/timer.py', [], [ './test/jobs/timer/timer.py' ]).then(function(job_model) {
        expect(job_model).toBeDefined();
        expect(job_model.type).toEqual(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2);
        job_model.output = [ ]; //Manually insert expected output files
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

test('Check timer job is running', function(done) {
    expect.assertions(4);
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
            expect(body).toBeDefined();
            expect(body.status).toEqual(eaeutils.Constants.EAE_SERVICE_STATUS_BUSY);
            done();
        }
    );
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // 20 seconds
test('Wait for compute to go idle or dead', function(done) {
    expect.assertions(1);
    let t = setInterval(function() {
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

test('Delete timer job', function(done) {
    expect.assertions(1);
    ts.deleteJob(g_job).then(function(result) {
        expect(result).toBeTruthy();
        g_job = null;
        done();
    }, function(error) {
        done.fail(error.toString());
    });
});

test('Create cancel job & start running', function(done) {
    expect.assertions(6);
    ts.createJob(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2,
        './input/cancel.py', [], [ './test/jobs/cancel/cancel.py' ]).then(function(job_model) {
        expect(job_model).toBeDefined();
        expect(job_model.type).toEqual(eaeutils.Constants.EAE_JOB_TYPE_PYTHON2);
        job_model.output = [ ]; //Manually insert expected output files
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

test('Check cancel job is running', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'GET',
            baseUrl: 'http://localhost:' + config.port,
            uri: '/status',
            json: true
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.status).toEqual(eaeutils.Constants.EAE_SERVICE_STATUS_BUSY);
            done();
        }
    );
});

test('Cancel running job', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://localhost:' + config.port,
            uri: '/cancel',
            json: true
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
                return;
            }
            expect(response).toBeDefined();

            if (response.statusCode !== 200)
                done.fail(JSON.stringify(response));

            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.status).toEqual(eaeutils.Constants.EAE_JOB_STATUS_CANCELLED);
            done();
        }
    );
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // 20 seconds
test('Wait for compute to go idle or dead', function(done) {
    expect.assertions(1);
    let t = setInterval(function() {
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

test('Delete cancelable job', function(done) {
    expect.assertions(1);
    ts.deleteJob(g_job).then(function(result) {
        expect(result).toBeTruthy();
        g_job = null;
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
