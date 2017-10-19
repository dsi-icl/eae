const {Errorhelper} = require('eae-utils');

/**
 * @fn cluster
 * @param statusCollection A Plain JS object describing the swift object storage endpoint
 *
 * @constructor
 */
function Cluster(statusCollection){
    let _this = this;
    _this._statusCollection = statusCollection;

    // Bind member functions
    _this.getStatuses = _this.prototype.getStatuses.bind(this);
}

Cluster.prototype.getStatuses = function(){
    let _this = this;
    return new Promise(function (resolve, reject) {
        _this._statusCollection.find().then(function (statuses) {
                resolve(statuses);
            }, function (error) {
                reject(Errorhelper("Couldn't retrieve statuses.", error));
            }
        );
    })
};

module.export = Cluster;