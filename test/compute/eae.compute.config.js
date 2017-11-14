
const {Constants}  =  require('eae-utils');

module.exports = {
    mongoURL: 'mongodb://jean:root@146.169.33.32:27020/eaeservices',
    port: 3001,
    enableCors: true,
    swiftUsername: 'jean',
    swiftPassword: 'test',
    computeType: [Constants.EAE_COMPUTE_TYPE_PYTHON2],
    clusters:{}
};
