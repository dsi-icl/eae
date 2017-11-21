const request = require('request');
let fs = require('fs');
let config = require('deploy.test.config.js');

let adminUsername = 'admin';
let adminPassword = 'admin';


test('Create a Job and Upload the two files', function(done) {
    expect.assertions(14);
    let job = JSON.stringify({
        "type": "python",
        "main": "test.py",
        "params": ["Hello_this_is_patrick"],
        "input": ["test.py", "faust.txt"]
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
                    {
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                    },
                formData:
                    {
                        file:
                            {
                                value: fs.createReadStream('test/files/faust.txt'),
                                options:
                                    {
                                        filename: 'faust.txt',
                                        contentType: null
                                    }
                            },
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
                            {
                                'cache-control': 'no-cache',
                                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                            },
                        formData:
                            {
                                file:
                                    {
                                        value: fs.createReadStream('test/files/test.py'),
                                        options:
                                            {
                                                filename: 'test.py',
                                                contentType: null
                                            }
                                    },
                                jobID: jobID,
                                fileName: 'test.py',
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
                            done();
                        });
                });
        });
});


// TODO test current status of the job then testing download of the result file
//
// test('Testing Download of the Result File', function(done) {
//     expect.assertions(3);
//     let expectedFileSize = fs.statSync('test/files/Faust by Johann Wolfgang von Goethe.txt').size;
//     request(
//         {
//             method: 'POST',
//             baseUrl: 'http://127.0.0.1:' + config.port,
//             uri: '/file-download',
//             json: true,
//             body: {
//                 eaeUsername: adminUsername,
//                 fileName: 'Faust by Johann Wolfgang von Goethe.txt',
//                 jobID: '5a09bbea4a8rulesd63a665e'
//             }
//         }).on('response', function(response) {
//         let prom = new Promise(function(resolve, reject) {
//             let writable = fs.createWriteStream('file_test.txt');
//             let size = 0;
//             response.on('data', (chunk) => {
//                 size += chunk.toString().length;
//             writable.write(chunk);
//         });
//             response.on('end', () => {
//                 writable.end();
//             resolve(writable);
//         });
//             response.on('error', (error)=>{
//                 reject(error);
//         });
//         });
//         prom.then(function(writable){
//             expect(response).toBeDefined();
//             expect(response.statusCode).toEqual(200);
//             writable.on('close', function(){
//                 let newFileSize = fs.statSync('file_test.txt').size;
//                 expect(newFileSize).toEqual(expectedFileSize);
//                 done();
//             });
//         }, function(error){
//             done.fail(error.toString());
//         });
//     });
// });