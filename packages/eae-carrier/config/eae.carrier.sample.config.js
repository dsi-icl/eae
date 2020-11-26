
module.exports = {
    mongoURL: 'mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]',
    port: 8080,
    enableCors: true,
    swiftURL: 'http://0.0.0.0:8080',
    swiftUsername: 'root',
    swiftPassword: 'root',
    minIOHost: 'http://0.0.0.0',
    minIOPort: 9000,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    bucketRegion: 'region',
    useSSL: false,
    storageComponent: 'swift'
};
