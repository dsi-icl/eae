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
                    return;
                }
                expect(response).toBeDefined();
                expect(response.statusCode).toEqual(200);
                expect(body.status).toEqual(eaeutils.Constants.EAE_SERVICE_STATUS_IDLE);
                done();
            }
        );
    }, 2000); // 2 seconds
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
    }, 12000); // 12 seconds
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

test('Cancel job on idle compute, check error', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/cancel',
            json: true
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(400);
            expect(body).toBeDefined();
            expect(body.error).toBeDefined();
            done();
        }
    );
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

test('Check cancel job is running after 1 sec', function(done) {
    expect.assertions(4);
    setTimeout(function() {
        request(
            {
                method: 'GET',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/status',
                json: true
            },
            function (error, response, body) {
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
    }, 1000); // 1 sec
});

test('Cancel running job', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/cancel',
            json: true,
            body: {
                job_id: g_job._id.toHexString()
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
                return;
            }
            expect(response).toBeDefined();

            if (response.statusCode !== 200) {
                done.fail(JSON.stringify(response));
                return;
            }

            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.status[0]).toEqual(eaeutils.Constants.EAE_JOB_STATUS_CANCELLED);
            done();
        }
    );
});

test('Check compute is idle after 1 sec', function(done) {
    expect.assertions(3);
    setTimeout(function () {
        request(
            {
                method: 'GET',
                baseUrl: 'http://127.0.0.1:' + config.port,
                uri: '/status',
                json: true
            },
            function (error, response, body) {
                if (error) {
                    done.fail(error.toString());
                }
                expect(response).toBeDefined();
                expect(response.statusCode).toEqual(200);
                expect(body.status).toEqual(eaeutils.Constants.EAE_SERVICE_STATUS_IDLE);
                done();
            }
        );
    }, 1000); // 1 Sec
});

test('Delete cancel job', function(done) {
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
