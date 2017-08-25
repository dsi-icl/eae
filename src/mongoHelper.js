const { ErrorHelper } =  require('eae-utils');

function MongoHelper(){
    //Init member vars
    this._statusCollection = null;
    this._jobsCollection = null;
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
 * @desc Retrieves the list of Nodes for the list of specified status.
 * @param filter
 * @param projection
 * @return {Array} returns and array with all the nodes matching the desired status
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


module.exports = MongoHelper;