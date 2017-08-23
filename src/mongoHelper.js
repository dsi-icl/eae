const mongodb = require('mongodb').MongoClient;

function MongoHelper(){


}

/**
 * @fn retrieveNodesWithStatus
 * @desc Retrieves the list of Nodes for the list of specified status.
 * @param nodesStatus Array of desired status -- Idle, Busy, Reserved or Dead
 * @return {Array} returns and array with all the nodes matching the desired status
 */
MongoHelper.prototype.retrieveNodesWithStatus(statusArray){
    var _this = this;

}


module.exports = MongoHelper;