const request = require('request');
const { ErrorHelper } = require('eae-utils');
const { interface_constants } = require('../core/models.js');

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
    this.checkAlgorithmListValidity = AlgorithmHelper.prototype.checkAlgorithmListValidity.bind(this);
}
/**
 * @fn getListOfAlgos
 * @desc Get the list of algorithms for the AlgoService
 * @return {Promise} Resolve to the list of algorithms with their current version
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

/**
 * @fn checkAlgorithmListValidity
 * @params algorithmsList
 * @desc Checks that the algorithms list is well formed and the associated access levels are valid.
 * @return {Promise} Resolve to true if the algorithm list is well formed
 * @private
 */
AlgorithmHelper.prototype.checkAlgorithmListValidity = function(algorithmsList){
    let _this = this;

    return new Promise(function(resolve, reject) {
        let error = false;
        if(algorithmsList === null || algorithmsList === undefined){
            resolve(true);
        }
        // we check that all algorithms of the user exist
        let authorized_algorithms = _this.getListOfAlgos();
        let keys = Object.keys(algorithmsList);
        keys.forEach(function (key) {
            if (!authorized_algorithms.hasOwnProperty(key)) {
                error = true;
                reject(ErrorHelper('The update for user contains an unknown algorithm: ' + key));
            }
            if(!interface_constants.ACCESS_LEVELS.hasOwnProperty(algorithmsList[key])){
                error = true;
                reject(ErrorHelper('The update for user contains an unknown algorithm access level: ' + algorithmsList[key]));
            }
        });
        resolve(error);
    });
};


module.exports = AlgorithmHelper;
