const ObjectID = require('mongodb').ObjectID;
const { ErrorHelper, Constants } = require('eae-utils');
const child_process = require('child_process');

function JobExecutorAbstract(jobID, jobCollection) {
    this._jobID = new ObjectID(jobID);
    this._jobCollection = jobCollection;
    this._model = undefined;
    this._callback = null;

    //Bind member functions
    this.fetchModel = this.prototype.fetchModel.bind(this);
    this.pushModel = this.prototype.pushModel.bind(this);
    this._exec = this.prototype._exec.bind(this);
    this._kill = this.prototype._kill.bind(this);

    //Bind pure member functions
    this._preExecution = this.prototype._preExecution.bind(this);
    this._postExecution = this.prototype._postExecution.bind(this);
    this.startExecution = this.prototype.startExecution.bind(this);
    this.stopExecution = this.prototype.stopExecution.bind(this);

    //Fetch model once
    this.fetchModel();
}

/**
 * @fn fetchModel
 * @desc Retrieve the job data model from the MongoDB jobs collection
 * @return {Promise} Resolve to the retrieved data model on success, errorStack on error
 */
JobExecutorAbstract.prototype.fetchModel = function() {
    var _this = this;

    return new Promise(function(resolve, reject) {
        _this._jobCollection.findOne({ _id : _this._jobID })
            .then(function(jobModel) {
                _this._model = jobModel;
                resolve(jobModel);
            }, function(error) {
                reject(ErrorHelper('Failed to fetch job ' + _this._jobID.toHexString(), error));
            });
    });
};

/**
 * @fn pushModel
 * @desc Store the job data model into the MongoDB jobs collection
 * @return {Promise} Resolve to the updated data model on success, errorStack on error
 */
JobExecutorAbstract.prototype.pushModel = function() {
    var _this = this;

    return new Promise(function(resolve, reject) {
        var replacementData = _this._model;
        delete replacementData._id; //Cleanup MongoDB managed _id field, if any
        _this._jobCollection.findOneAndReplace({ _id : _this._jobID }, replacementData, { upsert: true, returnOriginal: false })
            .then(function(success) {
                resolve(success.value);
            }, function(error) {
                reject(ErrorHelper('Failed to push job ' + _this._jobID.toHexString(), error));
            });
    });
};

/**
 * @fn _exec
 * @desc Cleans model, create a child process and handle child process events
 * @param command {String} Shell command
 * @param args {Array} Arguments on the command line
 * @param options Child process options (env, cwd)
 * @private
 */
JobExecutorAbstract.prototype._exec = function(command, args, options) {
    var _this = this;

    var end_fn = function(status, code) {
        var save_fn = function() {
            _this.pushModel().then(function(success) {
                if (_this.callback !== null && _this._callback !== undefined)
                    _this._callback(null, success.status);
            }, function(error) {
                if (_this.callback !== null && _this._callback !== undefined)
                    _this._callback(error, null);
            });
        };

        _this._postExecution().then(function() {
            _this._model.status = status;
            _this._model.exitCode = code;
            _this._model.endDate = new Date();
            if (_this._child_process !== undefined) {
                delete _this._child_process;
            }
            save_fn();
        }, function () {
            _this._model.status = Constants.EAE_JOB_STATUS_ERROR;
            _this._model.exitCode = 1;
            _this._model.endDate = new Date();
            if (_this._child_process !== undefined) {
                delete _this._child_process;
            }
            save_fn();
        }); // Post execution error
    }; // end_fn

    //Clean model for execution
    _this._model.stdout = '';
    _this._model.stderr = '';
    _this._model.status = Constants.EAE_JOB_STATUS_RUNNING;
    _this._model.startDate = new Date();
    _this._preExecution().then(function() {

        //Fork a process on the machine
        _this._child_process = child_process.spawn(command, args, options);

        //Stores stdout
        _this._child_process.stdout.on('data', function (data) {
            _this._model.stdout += data;
        });

        //Stores stderr
        _this._child_process.stderr.on('data', function (data) {
            _this._model.stderr += data;
        });

        //Handle spawn errors
        _this._child_process.on('error', function () {
            end_fn(Constants.EAE_JOB_STATUS_ERROR, 1);
        });

        //Handle child termination
        _this._child_process.on('exit', function (code, signal) {
            if (code !== null || signal == 'SIGTERM') { //Successful run or interruption
               end_fn(Constants.EAE_JOB_STATUS_DONE, code);
            }
            else {
                end_fn(Constants.EAE_JOB_STATUS_ERROR, 1);
            }
        });
    }, function (error) {
        end_fn(Constants.EAE_JOB_STATUS_ERROR, 1);
    });
};

/**
 * @fn _kill
 * @desc Triggers kill signal on the child process, if any
 * @private
 */
JobExecutorAbstract.prototype._kill = function() {
    var _this = this;

    if (_this._child_process !== undefined) {
        _this._child_process.kill('SIGTERM');
    }
};

/**
 * @fn _preExecution
 * @desc Called before executing the job in a separate process.
 * Each implementation SHOULD prepare its inputs and params here
 * @return {Promise} Resolve to true on successful preparation
 * @private
 * @pure
 */
JobExecutorAbstract.prototype._preExecution = function() {
    throw 'Pure method should be implemented in child class';
};

/**
 * @fn _postExecution
 * @desc Called after executing the job in a separate process.
 * Each implementation SHOULD save its outputs and clean here
 * @return {Promise} Resolve to true on successful cleanup
 * @private
 * @pure
 */
JobExecutorAbstract.prototype._postExecution = function() {
    throw 'Pure method should be implemented in child class';
};

/**
 * @fn startExecution
 * @param callback {Function} Function called after execution. callback(error, status)
 * @desc Starts the execution of designated job.
 * @pure
 */
JobExecutorAbstract.prototype.startExecution = function(callback) {
    this._callback = callback;
    throw 'Pure method should be implemented in child class';
};

/**
 * @fn stopExecution
 * @desc Interrupts the currently executed job./
 * @param callback {Function} Function called after execution. callback(error, status)
 * @pure
 */
JobExecutorAbstract.prototype.stopExecution = function(callback) {
    this._callback = callback;
    throw 'Pure method should be implemented in child class';
};

module.exports = JobExecutorAbstract;
