const request = require('request');
let fs = require('fs');
let config = require('deploy.test.config.js');
let eaeutils = require('eae-utils');

let adminUsername = 'admin';
let adminPassword = 'admin';


test('Create a Job and Upload the two files', function(done) {
    expect.assertions(25);
    let job = JSON.stringify({
        "type": eaeutils.Constants.EAE_JOB_TYPE_PYTHON2,
        "main": "test.py",
        "params": ["Hello_this_is_patrick"],
        "input": ["faust.txt"]
    });
    request(
        {
            method: 'POST',
            baseUrl: 'http://' + config.interfaceURL + ':' + config.interfacePort,
            uri: '/job/create',
            json: true,
            body: {
                eaeUsername: adminUsername,
                eaeUserToken: adminPassword,
                job: job
            }
        },
        function (error, response, body) {
            if (error) {
                done.fail(error.toString());
            }
            expect(response).toBeDefined();
            expect(response.statusCode).toEqual(200);
            expect(body).toBeDefined();
            expect(body.status).toEqual('OK');
            expect(body.jobID).toBeDefined();

            let carrierURL = body.carriers[0];
            let jobID = body.jobID;

            let options = {
                method: 'POST',
                url: 'http://' + carrierURL + '/file-upload',
                headers:
                    {   'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'},
                formData:
                    {  file:
                        {   value: fs.createReadStream('test/files/faust.txt'),
                            options:
                                {   filename: 'faust.txt',
                                    contentType: null    }},
                        jobID: jobID,
                        fileName: 'faust.txt',
                        eaeUsername: 'admin'
                    }
            };

            request(options,
                function (error, response, body) {
                    if (error) {
                        done.fail(error.toString());
                    }
                    expect(response).toBeDefined();
                    expect(response.statusCode).toEqual(200);
                    expect(body).toBeDefined();
                    expect(body).toEqual('true');

                    let options2 = {
                        method: 'POST',
                        url: 'http://' + carrierURL + '/file-upload',
                        headers:
                            {   'cache-control': 'no-cache',
                                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                            },
                        formData:
                            {   file:
                                {   value: fs.createReadStream('test/files/test.py'),
                                    options:
                                        {   filename: 'test.py',
                                            contentType: null
                                        }},
                                jobID: jobID,
                                fileName: 'test.py',
                                eaeUsername: 'admin'
                            }};

                    request(options2,
                        function (error, response, body) {
                            if (error) {
                                done.fail(error.toString());
                            }
                            expect(response).toBeDefined();
                            expect(response.statusCode).toEqual(200);
                            expect(body).toBeDefined();
                            expect(body).toEqual('true');

                            setTimeout(function(){
                                request(
                                    {
                                        method: 'POST',
                                        baseUrl: 'http://' + config.interfaceURL + ':' + config.interfacePort ,
                                        uri: '/job',
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
                                        expect(body.type).toEqual(eaeutils.Constants.EAE_COMPUTE_TYPE_PYTHON2);
                                        expect(body.requester).toEqual(adminUsername);
                                        expect(body.main).toEqual('test.py');
                                        expect(body.statusLock).toEqual(false);
                                        expect(body.exitCode).toEqual(-1);
                                        expect(body.input).toEqual([ 'faust.txt' ]);
                                    });
                            }, 5000);

                            setTimeout(function () {
                                    request(
                                        {
                                            method: 'POST',
                                            baseUrl: 'http://' + carrierURL,
                                            uri: '/file-download',
                                            json: true,
                                            body: {
                                                eaeUsername: adminUsername,
                                                fileName: 'test_out.txt',
                                                jobID: jobID
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
                                                let isFileWritten = (fs.statSync('file_test.txt').size > 0);
                                                expect(isFileWritten).toEqual(true);
                                                done();
                                            });
                                        }, function(error){
                                            done.fail(error.toString());
                                        });
                                    });
                                },
                            20000);
                        });
                });
        });
});
