const { ErrorHelper } =  require('eae-utils');

/**
 * @class MongoHelper
 * @desc Global mongo helper for the scheduler
 * @constructor
 */
function MongoHelper(){
    //Init member vars
    this._statusCollection = null;
    this._jobsCollection = null;
    this._jobsArchiveCollection = null;

    //Bind member functions
    this.setCollections = MongoHelper.prototype.setCollections.bind(this);
    this.retrieveNodesStatus = MongoHelper.prototype.retrieveNodesStatus.bind(this);
    this.retrieveJobs = MongoHelper.prototype.retrieveJobs.bind(this);
    this.updateNodeStatus = MongoHelper.prototype.updateNodeStatus.bind(this);
    this.updateJob = MongoHelper.prototype.updateJob.bind(this);
    this.archiveJob = MongoHelper.prototype.archiveJob.bind(this);
}

/**
 * @fn setCollection
 * @desc Setup the mongoDB collection to sync against
 * @param statusCollection Initialized mongodb collection to work against for nodes' status
 * @param jobsCollection Initialized mongodb collection to work against for jobs processing
 * @param jobsArchiveCollection  Initialized mongodb collection to work against for archiving jobs
 */
MongoHelper.prototype.setCollections = function(statusCollection, jobsCollection, jobsArchiveCollection) {
    this._statusCollection = statusCollection;
    this._jobsCollection = jobsCollection;
    this._jobsArchiveCollection = jobsArchiveCollection;
};

/**
 * @fn retrieveNodesWithStatus
 * @desc Retrieves the list of Nodes for the list of specified filter and projection.
 * @param filter
 * @param projection
 * @return {Promise} returns an array with all the nodes matching the desired status and projection
 */
MongoHelper.prototype.retrieveNodesStatus = function(filter, projection = {}){
    let _this = this;

    return new Promise(function(resolve, reject) {
        if (_this._statusCollection === null || _this._statusCollection === undefined) {
            reject(ErrorHelper('No MongoDB collection to retrieve the nodes statuses against'));
            return;
        }

        _this._statusCollection.find(filter, projection).toArray().then(function(docs) {
                resolve(docs);
            },function(error) {
                reject(ErrorHelper('Retrieve Nodes Status has failed', error));
            }
        );
    });
};

/**
 * @fn retrieveJobs
 * @desc Retrieves the list of Jobs
 * @param filter MongoDB filter for the query
 * @param projection MongoDB projection
 * @return {Promise} returns an array with all the jobs matching the desired status
 */
MongoHelper.prototype.retrieveJobs = function(filter, projection = {}){
    let _this = this;

    return new Promise(function(resolve, reject) {
        if (_this._jobsCollection === null || _this._jobsCollection === undefined) {
            reject(ErrorHelper('No MongoDB collection to retrieve the jobs against'));
            return;
        }

        _this._jobsCollection.find(filter, projection).toArray().then(function(docs) {
                resolve(docs);
            },function(error) {
                reject(ErrorHelper('Retrieve Jobs has failed', error));
            }
        );
    });
};

/**
 * @fn retrieveNodesWithStatus
 * @desc Retrieves the list of Nodes for the list of specified filter and projection.
 * @param node Node to be updated
 * @return {Promise} Resolve to true if update operation has been successful
 */
MongoHelper.prototype.updateNodeStatus = function(node){
    let _this = this;

    return new Promise(function(resolve, reject) {
        if (_this._statusCollection === null || _this._statusCollection === undefined) {
            reject(ErrorHelper('No MongoDB collection to retrieve the nodes statuses against'));
            return;
        }

        let filter = { //Filter is based on ip/port combination
            ip: node.ip,
            port: node.port
        };

        _this._statusCollection.findOneAndUpdate(filter,
                                        { $set : node},
                                        { returnOriginal: true, w: 'majority', j: false })
            .then(function(res) {
                resolve(res);
            },function(error){
                reject(ErrorHelper('The update of the nodes status dead to locked has failed', error));
            }
        );
    });
};

/**
 * @fn updateJob
 * @desc Update the job for the specified filter and projection.
 * @param  job New json job to be inserted back to mongo.
 * @return {Promise} Resolve to the result of the update if update operation has been successful
 */
MongoHelper.prototype.updateJob = function(job){
    let _this = this;

    return new Promise(function(resolve, reject) {
        if (_this._jobsCollection === null || _this._jobsCollection === undefined) {
            reject(ErrorHelper('No MongoDB collection to retrieve the jobs against'));
            return;
        }

        let filter = {
            _id: job._id
        };

        _this._jobsCollection.updateOne(filter,
            { $set : job},
            { w: 'majority', j: false })
            .then(function(success) {
                    resolve(success.result);
                },function(error){
                    reject(ErrorHelper('The update of the job has failed', error));
                }
            );
    });
};

/**
 * @fn archiveJob
 * @desc transfer an expired job to the archive of jobs and purges swift.
 * @param jobId id of the job to be transferred to the archive.
 * @return {Promise} Resolve to the job if the delete Job is successful
 */
MongoHelper.prototype.archiveJob = function(jobId){
    let _this = this;

    return new Promise(function(resolve, reject) {
        if (_this._jobsCollection === null || _this._jobsCollection === undefined ||
                _this._jobsArchiveCollection === null || _this._jobsArchiveCollection === undefined) {
            reject(ErrorHelper('Jobs and/or Archive collections in MongoDB is/are not accessible'));
            return;
        }

        let filter = { _id:  jobId };

        _this._jobsCollection.findOne(filter).then(function(job) {
                delete job._id;
                _this._jobsArchiveCollection.insert(job).then(function(success) {
                        if (success.insertedCount === 1) {
                            _this._jobsCollection.deleteOne(filter).then(function(){
                                console.log('The job ' + jobId + 'has been successfully archived');
                                resolve(job);
                            },function(error){
                                reject(ErrorHelper('The old job could not be deleted properly from jobsCollection. ' +
                                    'JobID:' + jobId ,error));
                            });
                        }else{
                            reject(ErrorHelper('The job couldn\'t be inserted properly. The insert count != 1. ' +
                                'JobID:' + jobId));
                        }
                    },function(error){
                        reject(ErrorHelper('The job couldn\'t be inserted properly. The insert count != 1. ' +
                            'JobID:' + jobId, error));
                    }
                );
            },function(error){
                reject(ErrorHelper('The job couldn\'t be found JobID:' + jobId, error));
            }
        );
    });
};

module.exports = MongoHelper;