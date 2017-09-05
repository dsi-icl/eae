const ObjectID = require('mongodb').ObjectID;
const { ErrorHelper, Constants } =  require('eae-utils');

const JobExecutorPython = require('./jobExecutorPython.js');
const JobExecutorPip = require('./jobExecutorPip.js');

/**
 * @class JobExecutorFactory
 * @desc Jobs execution context factory.
 * Select the right implementation for jobs based on their types
 * @constructor
 */
function JobExecutorFactory() {
    //Init member vars

    //Bind member functions
    this.createFromId = JobExecutorFactory.prototype.createFromId.bind(this);
}

/**
 * @fn createFromID
 * @param jobID {String} Job unique identifier in DB (24 hex chars)
 * @param jobCollection MongoDD job storage collection
 * @return {Promise} Resolve to executor implementation based on job type OR rejects an error stack
 */
JobExecutorFactory.prototype.createFromId = function(jobID, jobCollection) {
    return new Promise(function(resolve, reject) {
        jobCollection.findOne({ _id: new ObjectID(jobID) }).then(function(jobModel) {
            jobModel = Object.assign({type: 'unknown_id'}, jobModel);
            switch (jobModel.type) {
                case Constants.EAE_JOB_TYPE_PYTHON2:
                    resolve(new JobExecutorPython(jobID, jobCollection, jobModel));
                    break;
                case Constants.EAE_JOB_TYPE_PIP:
                    resolve(new JobExecutorPip(jobID, jobCollection, jobModel));
                    break;
                default:
                    reject(ErrorHelper('Execution is not supported for ' + jobModel.type));
                    break;
            }
        }, function (error) {
            reject(ErrorHelper('Cannot create job executor', error));
        });
    });
};

module.exports = JobExecutorFactory;
