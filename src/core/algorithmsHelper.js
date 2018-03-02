const request = require('request');
const { ErrorHelper } = require('eae-utils');

/**
 * @fn AlgorithmHelper
 * @desc Algorithms manager. Use it to update the available algorithms in OPAL
 * @param algoServiceURL URL of the algorithm service
 * @constructor
*/
function AlgorithmHelper(algoServiceURL) {
    //Init member vars
    this._algoServiceURL = algoServiceURL;

    //Bind member functions
    this.getListOfAlgos = AlgorithmHelper.prototype.getListOfAlgos.bind(this);
}
/**
 * @fn _sync
 * @desc Update the status in the global status collection.
 * Identification is based on the ip/port combination
 * @return {Promise} Resolve to true if update operation has been successful
 * @private
 */
AlgorithmHelper.prototype.getListOfAlgos = function() {
    let _this = this;
    // return new Promise(function(resolve, reject) {
    //
    //     request({
    //         method: 'GET',
    //         baseUrl: _this._algoServiceURL,
    //         uri: '/list',
    //         json: true
    //     }, function (error, response, body) {
    //         if (error) {
    //             reject(ErrorHelper());
    //         }
    //
    //
    //     });
    // });

    return {'pop-density':{version:1}};
};


module.exports = AlgorithmHelper;
