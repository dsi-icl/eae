const fs = require('fs-extra');
const path = require('path');
const { StatusHelper } =  require('eae-utils');

/**
 * @fn StatusController
 * @desc Controller to manage the service status
 * @param statusCollection MongoDb collection storing the status entries
 * @param options Optional additional fields to add in the status
 * @constructor
 */
function StatusController(statusCollection, options = {}) {
    this._helper = new StatusHelper(type = 'eae-compute', port = global.eae_compute_config.port, mongoURL = null, options = options);
    this._helper.setCollection(statusCollection);

    this.getStatus = StatusController.prototype.getStatus.bind(this);
	this.getFullStatus = StatusController.prototype.getFullStatus.bind(this);
}

/**
 * @fn getStatus
 * @desc HTTP method GET handler on this service status
 * @param req Express.js request object
 * @param res Express.js response object
 */
StatusController.prototype.getStatus = function(req, res) {
	res.status(200);
	res.json(this._helper.getStatus());
};

/**
 * @fn getFullStatus
 * @desc HTTP method GET handler on this service status & specifications
 * @param req Express.js request object
 * @param res Express.js response object
 */
StatusController.prototype.getFullStatus = function(req, res) {
	res.status(200);
	res.json(this._helper.getDataModel());
};

module.exports = StatusController;
