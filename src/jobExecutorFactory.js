const ObjectID = require('mongodb').ObjectID;
const { Constants, ErrorHelper } =  require('eae-utils');

function JobExecutorFactory() {
    //Init member vars
    //None
    //Bind member functions
}

JobExecutorFactory.prototype.create = function(jobID, jobCollection) {
    var _this = this;
    return new Promise(function(resolve, reject) {
        jobCollection.findOne({ _id: new ObjectID(jobID) }, { fields : 'type' }).then(function(job) {
            console.log(job);
            throw 'TODO implement switch case on supported executor types';
            // resolve(executor);
        }, function (error) {
            reject(ErrorHelper('Cannot create job executor', error));
        });
    });
};

module.exports = JobExecutorFactory;
