const ObjectID = require('mongodb').ObjectID;
const { ErrorHelper } =  require('eae-utils');

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
 * @return {Promise} Resolve to executor implementation based on job type OR reject an error stack
 */
JobExecutorFactory.prototype.createFromId = function(jobID, jobCollection) {
    return new Promise(function(resolve, reject) {
        jobCollection.findOne({ _id: new ObjectID(jobID) }, { fields : { 'type': 1 } }).then(function(job) {
            switch (job.type) {
                case 'python':
                    resolve(new JobExecutorPython(jobID, jobCollection));
                    break;
                case 'pip':
                    resolve(new JobExecutorPip(jobID, jobCollection));
                    break;
                default:
                    reject(ErrorHelper('Execution is not supported for ' + job.type));
                    break;
            }
        }, function (error) {
            reject(ErrorHelper('Cannot create job executor', error));
        });
    });
};

module.exports = JobExecutorFactory;
