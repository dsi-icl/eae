const request = require('request');
const eaeutils = require('eae-utils');
let config = require('../config/eae.interface.test.config.js');
let TestServer = require('./testserver.js');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;// 20 seconds

let ts = new TestServer();
let adminUsername = 'adminUsers';
let adminPassword = 'qwertyUsers';
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
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                requestedUsername: adminUsername
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.username).toEqual(adminUsername);
            expect(body.token).toEqual(adminPassword);
            done();
        }
    );
});

test('Get user that doesn\'t exist', function(done) {
    expect.assertions(4);
    let requestedUsername = 'DodgyDude';
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                requestedUsername: requestedUsername
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(401);
            expect(body).toBeDefined();
            expect(body).toEqual('User ' + requestedUsername + ' doesn\'t exist.');
            done();
        }
    );
});

test('Get All standard Users (when there is none)', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user/getAllOf',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                userType: 'STANDARD'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body).toEqual([]);
            done();
        });
});

test('Create a new user', function(done) {
    expect.assertions(3);
    let newUser = JSON.stringify({"username": "NotLegit"});
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user/create',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                newUser: newUser
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            done();
        });
});

test('Get All Users', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user/getAllOf',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                userType: 'all'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body).toEqual([{username: 'adminUsers'},{username: 'NotLegit'}]);
            done();
        });
});

test('Get All Admin Users', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user/getAllOf',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                userType: 'admin'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body).toEqual([{username: 'adminUsers'}]);
            done();
        });
});

test('Get All standard Users', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user/getAllOf',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                userType: 'STANDARD'
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body).toEqual([{username: 'NotLegit'}]);
            done();
        });
});

test('Delete a user', function(done) {
    expect.assertions(8);
    let userToBeDeleted = 'NotLegit';
    request(
        {
            method: 'DELETE',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/user/delete',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                userToBeDeleted: userToBeDeleted
            }
        },
        function(error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body).toEqual('The user ' + userToBeDeleted + ' has been successfully deleted');
            request(
                {
                    method: 'POST',
                    baseUrl: 'http://127.0.0.1:' + config.port,
                    uri: '/user',
                    json: true,
                    body: {
                        eaeUsername: adminUsername,
                        eaeUserToken: adminPassword,
                        requestedUsername: userToBeDeleted
                    }
                },
                function(error, response, body) {
                    if (error) {
                        done.fail(error.toString());
                    }
                    expect(response).toBeDefined();
                    expect(response.statusCode).toEqual(401);
                    expect(body).toBeDefined();
                    expect(body).toEqual('User ' + userToBeDeleted + ' doesn\'t exist.');
                    done();
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
