const request = require('request');
const { ErrorHelper } = require('eae-utils');
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

test('Cluster Status Missing Credentials Username', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/servicesStatus',
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

test('Cluster Status Missing Credentials Token', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/servicesStatus',
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

test('Cluster Status Invalid Credentials', function(done) {
    expect.assertions(4);
    request(
        {
            method: 'POST',
            baseUrl: 'http://127.0.0.1:' + config.port,
            uri: '/servicesStatus',
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

// test('Cluster Status User Unauthorized Access Attempt', function(done) {
//     expect.assertions(7);
//     let newUser = {"username": "NotLegit"};
//     request(
//         {
//             method: 'POST',
//             baseUrl: 'http://127.0.0.1:' + config.port,
//             uri: '/user/create',
//             json: true,
//             body: {
//                 eaeUsername: 'admin',
//                 eaeUserToken: 'qwerty1234',
//                 newUser: newUser
//             }
//         },
//         function(error, response, body) {
//             if (error) {
//                 done.fail(error.toString());
//             }
//             expect(response).toBeDefined();
//             console.log(body);
//             expect(response.statusCode).toEqual(200);
//             expect(body).toBeDefined();
//             delete body._id;
//             newUser = body;
//         });
//
//     request(
//         {
//             method: 'POST',
//             baseUrl: 'http://127.0.0.1:' + config.port,
//             uri: '/servicesStatus',
//             json: true,
//             body: {
//                 eaeUsername: 'NotLegit',
//                 eaeUserToken: newUser.token
//             }
//         },
//         function(error, response, body) {
//             if (error) {
//                 done.fail(error.toString());
//             }
//             expect(response).toBeDefined();
//             expect(response.statusCode).toEqual(401);
//             expect(body).toBeDefined();
//             expect(body).toEqual({error:'The user is not authorized to access this command'});
//             done();
//         }
//     );
// });


afterAll(function() {
    return new Promise(function (resolve, reject) {
        ts.stop().then(function() {
            resolve(true);
        }, function (error) {
            reject(error.toString());
        });
    });
});

