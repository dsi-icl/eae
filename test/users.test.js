const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.interface.test.config.js');
let TestServer = require('./testserver.js');

let ts = new TestServer();
beforeAll(function() {
    return new Promise(function (resolve, reject) {
        ts.run().then(function() {
            ts.addAdminUser().then(function(){
                resolve(true);
            },function(insertError){
                reject(insertError);
            });
        }, function (error) {
            reject(error.toString());
        });
    });
});

test('Get user Missing Credentials Username', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user',
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

test('Get user Missing Credentials Token', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user',
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

test('Get user Invalid Credentials', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user',
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
            expect(body).toEqual({error:'Unauthorized access. The unauthorized access has been logged.'});
            done();
        }
    );
});

test('Get user Admin previously created', function(done) {
    expect.assertions(5);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user',
            json: true,
            body: {
                eaeUsername: 'admin',
                eaeUserToken: 'qwerty1234',
                requestedUsername: 'admin'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.type).toEqual('ADMIN');
            expect(body.token).toEqual('qwerty1234');
            done();
        }
    );
});

test('Get user Admin previously created', function(done) {
    expect.assertions(5);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user',
            json: true,
            body: {
                eaeUsername: 'admin',
                eaeUserToken: 'qwerty1234',
                requestedUsername: 'admin'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.type).toEqual('ADMIN');
            expect(body.token).toEqual('qwerty1234');
            done();
        }
    );
});

test('Get user Admin previously created', function(done) {
    expect.assertions(5);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user',
            json: true,
            body: {
                eaeUsername: 'admin',
                eaeUserToken: 'qwerty1234',
                requestedUsername: 'admin'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.type).toEqual('ADMIN');
            expect(body.token).toEqual('qwerty1234');
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
