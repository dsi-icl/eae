const request = require('request');
const { ErrorHelper } = require('eae-utils');
const { interface_constants } = require('../core/models.js');
const fs = require('fs');
const Ajv = require('ajv');

/**
 * @fn AlgorithmHelper
 * @desc Algorithms manager. Use it to update the available algorithms in OPAL
 * @param algoServiceURL URL of the algorithm service
 * @param algorithmsSpecsFolder schemas of the algorithms
 * @constructor
*/
function AlgorithmHelper(algoServiceURL, algorithmsSpecsFolder) {
    //Init member vars
    this._algoServiceURL = algoServiceURL;
    this._requestsFieldsValidators = null;
    this._enabledAlgorithms = null;

    //Bind member functions
    this.getListOfAlgos = AlgorithmHelper.prototype.getListOfAlgos.bind(this);
    this.checkAlgorithmListValidity = AlgorithmHelper.prototype.checkAlgorithmListValidity.bind(this);
    this.getEnabledAlgorithms = AlgorithmHelper.prototype.getEnabledAlgorithms.bind(this);

    this._setAlgorithmsAPIEnabled(algorithmsSpecsFolder);
}
/**
 * @fn getListOfAlgos
 * @desc Get the list of algorithms for the AlgoService
 * @return {Promise} Resolve to the list of algorithms with their current version
 */
AlgorithmHelper.prototype.getListOfAlgos = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        request({
            method: 'GET',
            baseUrl: _this._algoServiceURL,
            uri: '/list',
            json: true
        }, function (error, response, body) {
            if (error) {
                reject(ErrorHelper(error));
            }
            if(response.statusCode !== 200){
                reject(ErrorHelper('The status code is not 200. Status code:' + response.statusCode));
            }
            let listOfAlgos = {};
            body.item.forEach(function(algo){
                listOfAlgos[algo._id] = {version: algo.version};
                }
            );
            resolve(listOfAlgos);
        });
    });
};

/**
 * @fn checkAlgorithmListValidity
 * @params algorithmsList
 * @desc Checks that the algorithms list is well formed and the associated access levels are valid.
 * @return {Promise} Resolve to true if the algorithm list is well formed
 */
AlgorithmHelper.prototype.checkAlgorithmListValidity = function(algorithmsList){
    let _this = this;

    return new Promise(function(resolve, reject) {
        let error = false;
        if(algorithmsList === null || algorithmsList === undefined){
            resolve(true);
        }
        // we check that all algorithms of the user exist
        _this.getListOfAlgos().then(function(authorized_algorithms){
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
        }, function(error){
            reject(ErrorHelper(error));
        });
    });
};

/**
 * @fn _setAlgorithmsAPIEnabled
 * @params algorithmsSpecsFolder
 * @desc Reads all the config files for every algorithms and list of all enabled algorithms and their params fields with
 * the expected types
 * @private
 */
AlgorithmHelper.prototype._setAlgorithmsAPIEnabled = function(algorithmsSpecsFolder) {
    let _this = this;
    let algoList = [];
    let validators = {};
    let schema = {};
    let ajv = new Ajv({allErrors: true});
    fs.readdirSync(algorithmsSpecsFolder).forEach(file => {
        schema = require(algorithmsSpecsFolder + '/' + file);
        validators[file] = ajv.compile(schema);
        if(file !== 'core'){
            algoList.concat(file);
        }
    });
    _this._enabledAlgorithms = algoList;
    _this._requestsFieldsValidators = validators;
};

/**
 * @fn getEnabledAlgorithms
 * @desc Sends back the list of all enabled algorithms and their params fields with the expected types
 * @return {list} Sends back the list of currently enables algorithms
 */
AlgorithmHelper.prototype.getEnabledAlgorithms = function() {
    let _this = this;
    return _this._enabledAlgorithms;
};

module.exports = AlgorithmHelper;
