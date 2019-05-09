const process = require('process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {Constants} = require('eae-utils');

const JobExecutorAbstract = require('./jobExecutorAbstract.js');
const { SwiftHelper, ErrorHelper } = require('eae-utils');

/**
 * @class JobExecutorPython3
 * @desc Specialization of JobExecutorAbstract for python scripts
 * @param jobID {String} The job unique identifier in DB
 * @param jobCollection MongoDB collection to sync the job model against
 * @param jobModel {Object} Plain js Job model from the mongoDB, optional if fetchModel is called
 * @constructor
 */
function JobExecutorPython3(jobID, jobCollection, jobModel) {
    JobExecutorAbstract.call(this, jobID, jobCollection, jobModel);

    // Init member attributes
    this._swift = new SwiftHelper({
        url: global.eae_compute_config.swiftURL,
        username: global.eae_compute_config.swiftUsername,
        password: global.eae_compute_config.swiftPassword
    });
    this._tmpDirectory = null;

    // Bind member functions
    this._preExecution = JobExecutorPython3.prototype._preExecution.bind(this);
    this._postExecution = JobExecutorPython3.prototype._postExecution.bind(this);
    this.startExecution = JobExecutorPython3.prototype.startExecution.bind(this);
    this.stopExecution = JobExecutorPython3.prototype.stopExecution.bind(this);

}
JobExecutorPython3.prototype = Object.create(JobExecutorAbstract.prototype); //Inherit Js style
JobExecutorPython3.prototype.constructor = JobExecutorPython3;

/**
 * @fn _preExecution
 * @desc Prepare jobs inputs and params
 * @return {Promise} Resolve to true on successful preparation
 * @private
 * @pure
 */
JobExecutorPython3.prototype._preExecution = function() {
    let _this = this;

    return new Promise(function (resolve, reject) {
        // Create input directory
        fs.mkdirSync(path.join(_this._tmpDirectory, 'input'));
        let file_transfer_promises = [];
        // We need to check what type of job we are dealing with swift or standard
        if(Object.keys(_this._model.swiftData).length !== 0){
            let containers = Object.keys(_this._model.swiftData);
            containers.forEach(function (container_id) {
                // Download each input file in the model from the swift store
                _this._model.swiftData[container_id].forEach(function (file) {
                    // Store the file in the input subdirectory
                    let tmpDestination = path.join(_this._tmpDirectory, 'input', file);

                    // Get download stream
                    let p = _this._swift.getFileReadStream(container_id, file).then(function (rs) {
                        let ws = fs.createWriteStream(tmpDestination); // Open file descriptor
                        rs.pipe(ws); //Pipe received data to be written in the file

                        // Listen to then end of the file transfer
                        resolve(new Promise(function (file_resolve, file_reject) {
                            rs.on('end', function () {
                                file_resolve(true);
                            });
                            rs.on('error', function (error) {
                                file_reject(ErrorHelper('Downloading ' + file + ' failed', error));
                            });
                        }));
                    }, function (error) {
                        reject(ErrorHelper('Downloading ' + file + ' has error', error));
                    });

                    // Push the file transfer promise into array
                    file_transfer_promises.push(p);
                });
            });
        }else {
            // Compute input container name
            let container_name = _this._jobID.toString() + '_input';

            // Download each input file in the model from the swift store
            _this._model.input.forEach(function (file) {
                // Store the file in the input subdirectory
                let tmpDestination = path.join(_this._tmpDirectory, 'input', file);

                // Get download stream
                let p = _this._swift.getFileReadStream(container_name, file).then(function (rs) {
                    let ws = fs.createWriteStream(tmpDestination); // Open file descriptor
                    rs.pipe(ws); //Pipe received data to be written in the file

                    // Listen to then end of the file transfer
                    resolve(new Promise(function (file_resolve, file_reject) {
                        rs.on('end', function () {
                            file_resolve(true);
                        });
                        rs.on('error', function (error) {
                            file_reject(ErrorHelper('Downloading ' + file + ' failed', error));
                        });
                    }));
                }, function (error) {
                    reject(ErrorHelper('Downloading ' + file + ' has error', error));
                });

                // Push the file transfer promise into array
                file_transfer_promises.push(p);
            });
        }
        //Wait for all files to be transferred
        Promise.all(file_transfer_promises).then(function (__unused__ok_array) {
            //Create output directory if doesnt exists
            if (fs.existsSync(path.join(_this._tmpDirectory, 'input', 'output')) === false) {
                fs.mkdirSync(path.join(_this._tmpDirectory, 'input', 'output'));
            }
            resolve(true); // All good
        }, function (error) {
            reject(ErrorHelper('Input download failed', error));
        });
    });
};

/**
 * @fn _postExecution
 * @desc Saves jobs outputs and clean
 * @return {Promise} Resolve to true on successful cleanup
 * @private
 * @pure
 */
JobExecutorPython3.prototype._postExecution = function() {
    let _this = this;
    return new Promise(function (resolve, reject) {
        let container_name = _this._jobID.toString() + '_output';
        let tmpSource = path.join(_this._tmpDirectory, 'input','output');
        let upload_file_promises = [];

        // Cleanup current output in model
        _this._model.output = [];

        // Create container
        _this._swift.createContainer(container_name).then(function(__unused__ok) {

            if (fs.existsSync(tmpSource) === false) {
                resolve(true); // No outputs
                return;
            }

            // List whats in the output directory
            fs.readdir(tmpSource, function(error, files) {
                if (error) {
                    reject(ErrorHelper('Listing output files failed', error));
                    return;
                }

                // Upload each file
                files.forEach(function(file) {
                    // Register file in output
                    _this._model.output.push(file);

                    let tmpFile = path.join(tmpSource, file);
                    let rs = fs.createReadStream(tmpFile);

                    // Upload file to swift container
                    let p = _this._swift.createFile(container_name, file, rs);
                    // Register uploading promise
                    upload_file_promises.push(p);
                });

                // Wait for all uploads to complete
                Promise.all(upload_file_promises).then(function(__unused__ok_array) {
                    resolve(true); // All good
                }, function(error) {
                    reject(ErrorHelper('Uploading output files failed', error));
                });
            });
        }, function(error) {
            reject(ErrorHelper('Creating output container failed', error));
        });
    });
};

/**
 * @fn startExecution
 * @param callback {Function} Function called after execution. callback(error, status)
 * @desc Starts the execution of designated job.
 */
JobExecutorPython3.prototype.startExecution = function(callback) {
    let _this = this;

    _this._callback = callback;
    // Create tmp directory
    fs.mkdtemp(os.tmpdir() + path.sep, function(error, directoryPath) {
        if (error) {
            callback(error);
            return;
        }
        _this._tmpDirectory = directoryPath; //Save tmp dir

        _this.fetchModel().then(function () {
            //Clean model for execution
            _this._model.stdout = '';
            _this._model.stderr = '';
            _this._model.status.unshift(Constants.EAE_JOB_STATUS_RUNNING);
            _this._model.startDate = new Date();
            _this.pushModel().then(function() {
                let cmd = 'python3 ' + _this._model.main;
                let args = _this._model.params;
                let opts = {
                    cwd: _this._tmpDirectory + '/input',
                    end: process.env,
                    shell: true
                };
                _this._exec(cmd, args, opts);
            }, function(error) {
                throw error;
            });
        }, function (error) {
            callback(error);
        });
    });
};

/**
 * @fn stopExecution
 * @desc Interrupts the currently executed job.
 * @param callback {Function} Function called after execution. callback(error, status)
 */
JobExecutorPython3.prototype.stopExecution = function(callback) {
    this._callback = callback;
    this._kill();
    // throw 'Should call _kill here';
};

module.exports = JobExecutorPython3;
