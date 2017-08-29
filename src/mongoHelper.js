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

    //Bind member functions
    this.setCollections = MongoHelper.prototype.setCollections.bind(this);
    this.retrieveNodesStatus = MongoHelper.prototype.retrieveNodesStatus.bind(this);
    this.retrieveJobs = MongoHelper.prototype.retrieveJobs.bind(this);
    this.updateNodeStatus = MongoHelper.prototype.updateNodeStatus.bind(this);
}

/**
 * @fn setCollection
 * @desc Setup the mongoDB collection to sync against
 * @param statusCollection Initialized mongodb collection to work against for nodes' status
 * @param jobsCollection Initialized mongodb collection to work against for jobs processing
 */
MongoHelper.prototype.setCollections = function(statusCollection, jobsCollection) {
    this._statusCollection = statusCollection;
    this._jobsCollection = jobsCollection;
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
 * @param filter
 * @param projection
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
 * @param filter
 * @param fields
 * @return {Promise} Resolve to true if update operation has been successful
 */
MongoHelper.prototype.updateNodeStatus = function(filter, fields){
    let _this = this;

    return new Promise(function(resolve, reject) {
        if (_this._statusCollection === null || _this._statusCollection === undefined) {
            reject(ErrorHelper('No MongoDB collection to retrieve the nodes statuses against'));
            return;
        }

        _this._statusCollection.findOneAndUpdate(filter,
                                                { $set : fields },
                                                { returnOriginal: false })
            .then(function(success) {
                resolve(success.value);
            },function(error) {
                reject(ErrorHelper('The update of the nodes status dead to locked has failed', error));
            }
        );
    });
};

module.exports = MongoHelper;