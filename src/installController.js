const { Constants, ErrorHelper } =  require('eae-utils');
const JobExecutorFactory = require('./jobExecutorFactory.js');

/**
 * @class InstallController
 * @desc Controller for packages/dependencies installation
 * @param statusHelper Status helper class
 * @constructor
 */
function InstallController(statusHelper) {
    //Init member vars
    this._status_helper = statusHelper;

    //Bind member functions
    this._factory = InstallController.prototype._factory.bind(this);
    this.install = InstallController.prototype.install.bind(this);
}

/**
 * @fn install
 * @desc Install synchronously requested packages on the machine
 * @param req Express.js request object
 * @param res Express.js response object
 */
InstallController.prototype.install = function(req, res) {
    var _this = this;
    var install_type = req.body ? req.body.type : undefined;
    var packages_list = req.body ? req.body.packages : undefined;

    if (install_type === undefined || install_type === null) {
        res.status(401);
        res.json(ErrorHelper('Unknown dependency type, aborting..'));
        return;
    }
    if (packages_list === undefined || packages_list === null || package_list.length === 0) {
        res.status(401);
        res.json(ErrorHelper('Missing packages list, aborting..'));
        return;
    }

    _this._status_helper.setStatus(Constants.EAE_SERVICE_STATUS_BUSY);
    _this._factory(install_type).then(function(installer) {
        installer.install(packages_list).then(function(_unused__success) {
            res.status(200);
            res.json({ ok: true, packages: packages_list });
            _this._status_helper.setStatus(Constants.EAE_SERVICE_STATUS_IDLE);
        }, function(error) {
            res.status(501);
            res.json(ErrorHelper('Installation failed', error));
            _this._status_helper.setStatus(Constants.EAE_SERVICE_STATUS_IDLE);
        })
    }, function(error) {
       res.status(501);
       res.json(ErrorHelper('Failed to start installer', error));
        _this._status_helper.setStatus(Constants.EAE_SERVICE_STATUS_IDLE);
    });
};

/**
 * @fn _factory
 * @param install_type {String}
 * @return {Promise}
 * @private
 */
InstallController.prototype._factory = function(install_type) {
    return new Promise(function(resolve, reject) {
        switch(install_type) {
            case 'pip':
                resolve(new PipInstaller());
                break;
            default:
                reject(ErrorHelper('Type no supported: ' + install_type));
                break;
        }
    });
};

module.exports = InstallController;
