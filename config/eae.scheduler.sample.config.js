
module.exports = {
    mongoURL: 'mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]',
    port: 8080,
	enableCors: true,
    jobsExpiredStatusTime: 720 , // Time in hours. 24h * 30d
    nodesExpiredStatusTime: 1, // Time in hours
    swiftURL: 'http://0.0.0.0:8080',
    swiftUsername: 'root',
    swiftPassword: 'root'
};
