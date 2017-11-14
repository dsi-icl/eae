
const {Constants}  =  require('eae-utils');

module.exports = {
    mongoURL: 'mongodb://mongodb:27017',
    port: 8080,
    enableCors: true,
    swiftURL: 'http://0.0.0.0:8080',
    swiftUsername: 'test',
    swiftPassword: 'test',
    computeType: [Constants.EAE_COMPUTE_TYPE_PYTHON2],
    clusters:{}
};
