const { Constants } =  require('eae-utils');
const mongodb = require('mongodb').MongoClient;
const MongoHelper = require('../src/mongoHelper');
let JobsScheduler = require('../src/jobsScheduler.js');

var mongoURL = 'mongodb://mongodb:27017';
// var mongoURL = 'mongodb://localhost:27017';
var db = null;
var mongo_helper = null;
var jobsScheduler = null;
var options = {
    keepAlive: 30000, connectTimeoutMS: 30000,
};

beforeEach(() => {
    return new Promise(function (resolve, reject) {
        mongodb.connect(mongoURL, options, function (err, mongo) {
            if (err !== null) {
                console.log("Could not connect to mongo: " + err);
                return;
            }
            db = mongo;
            console.log("Connected to Mongo");

            db.collection(Constants.EAE_COLLECTION_JOBS).deleteMany({}).then(() => {
                console.log("Cleared jobs collection");
                db.collection(Constants.EAE_COLLECTION_STATUS).deleteMany({}).then(() => {
                    console.log("Cleared status collection");
                    let node = {
                        ip: "192.168.0.1",
                        port: 80,
                        status: Constants.EAE_SERVICE_STATUS_IDLE,
                        computeType: "r",
                        statusLock: false
                    };

                    db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(node).then(() => {
                        console.log("Added idle worker");
                        mongo_helper = new MongoHelper();
                        mongo_helper.setCollections(db.collection(Constants.EAE_COLLECTION_STATUS),
                            db.collection(Constants.EAE_COLLECTION_JOBS),
                            db.collection(Constants.EAE_COLLECTION_JOBS_ARCHIVE),
                            db.collection(Constants.EAE_COLLECTION_FAILED_JOBS_ARCHIVE));

                        jobsScheduler = new JobsScheduler(mongo_helper);
                        console.log("Before all has been resolved");
                        resolve(true);
                    });
                });
            });
        });
    });
});


afterEach(() => {
    return new Promise(function (resolve, reject) {
        db.collection(Constants.EAE_COLLECTION_JOBS).drop().then(function() {
            db.collection(Constants.EAE_COLLECTION_STATUS).drop().then(function() {
                console.log("Resolved afterAll()");
                resolve(true);
            });
        });
    });
});

// Close mongo connection
afterAll(function ()  {
    return new Promise(function (resolve, reject) {
        db.close();
        console.log("Resolved afterEach()");
        resolve(true);
    });
});


test('_queued_jobs: A queued non-spark job gets scheduled', async () => {
    expect.assertions(1);

    let job = {
        status: [Constants.EAE_JOB_STATUS_QUEUED],
        type: "r",
        executorIP: '127.0.0.1',
        executorPort: 80,
        statusLock: false
    };

    await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(job);

    await jobsScheduler._queuedJobs();

    let jobs = await mongo_helper.retrieveJobs({_id: job._id});
    expect(jobs[0].status).toEqual([Constants.EAE_JOB_STATUS_SCHEDULED, Constants.EAE_JOB_STATUS_QUEUED]);
});

// test('_queued_jobs: A queued spark job gets scheduled', async () => {
//     expect.assertions(3);
//
//     let node2 = {
//         ip: "192.168.10.10",
//         port: 80,
//         status: Constants.EAE_SERVICE_STATUS_IDLE,
//         statusLock: false
//     };
//
//     let node3 = {
//         ip: "192.168.10.15",
//         port: 80,
//         status: Constants.EAE_SERVICE_STATUS_IDLE,
//         statusLock: false
//     };
//
//     let node = {
//         ip: "192.168.0.5",
//         port: 80,
//         status: Constants.EAE_SERVICE_STATUS_IDLE,
//         clusters: {
//             spark: [node2, node3]
//         },
//         computeType: Constants.EAE_JOB_TYPE_SPARK,
//         statusLock: false
//     };
//
//     let job = {
//         status: [Constants.EAE_JOB_STATUS_QUEUED],
//         statusLock: false,
//         type: Constants.EAE_JOB_TYPE_SPARK,
//     };
//
//     await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(job);
//     await db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(node);
//     await db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(node2);
//     await db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(node3);
//
//     await jobsScheduler._queuedJobs();
//
//     let nodes = await mongo_helper.retrieveNodesStatus({_id: node._id});
//     expect(nodes[0].status).toEqual(Constants.EAE_SERVICE_STATUS_LOCKED);
//
//     nodes = await mongo_helper.retrieveNodesStatus({_id: node2._id});
//     expect(nodes[0].status).toEqual(Constants.EAE_SERVICE_STATUS_BUSY);
//
//     nodes = await mongo_helper.retrieveNodesStatus({_id: node3._id});
//     expect(nodes[0].status).toEqual(Constants.EAE_SERVICE_STATUS_BUSY);
// });

test('_queued_jobs: If a queued job has failed 3 times, then it is set to dead and then completed', async () => {
    expect.assertions(2);

    let job = {
        status: [
            Constants.EAE_JOB_STATUS_QUEUED,
            Constants.EAE_JOB_STATUS_ERROR,
            Constants.EAE_JOB_STATUS_ERROR,
            Constants.EAE_JOB_STATUS_ERROR
        ],
        statusLock: false,
    };

    await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(job);

    await jobsScheduler._queuedJobs();

    let jobs = await mongo_helper.retrieveJobs({_id: job._id});
    expect(jobs[0].status[0]).toEqual(Constants.EAE_JOB_STATUS_COMPLETED);
    expect(jobs[0].status[1]).toEqual(Constants.EAE_JOB_STATUS_DEAD);
});

test('_errosJobs: A job in error state gets added to the archived collection and then queued again', async () => {
    expect.assertions(2);

    let job = {
        status: [Constants.EAE_JOB_STATUS_ERROR],
        statusLock: false,
    };

    await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(job);

    await jobsScheduler._errorJobs();

    let jobs = await mongo_helper.retrieveJobs({});
    expect(jobs[0].status).toEqual([Constants.EAE_JOB_STATUS_QUEUED, Constants.EAE_JOB_STATUS_ERROR]);

    let archived_jobs = await mongo_helper.retrieveFailedJobs({_id: job._id});
    expect(archived_jobs.length).toBe(1);
});

test('_errorJobs: When a spark job is in error status, its cluster gets freed', async () => {
    expect.assertions(2);

    let node2 = {
        ip: "192.168.10.10",
        port: 80,
        status: Constants.EAE_SERVICE_STATUS_BUSY,
        statusLock: false
    };

    let node3 = {
        ip: "192.168.10.15",
        port: 80,
        status: Constants.EAE_SERVICE_STATUS_BUSY,
        statusLock: false
    };

    let node = {
        ip: "192.168.0.5",
        port: 80,
        status: Constants.EAE_SERVICE_STATUS_LOCKED,
        clusters: {
            spark: [node2, node3]
        },
        statusLock: false
    };

    let job = {
        status: [Constants.EAE_JOB_STATUS_ERROR],
        statusLock: false,
        executorPort: 80,
        type: Constants.EAE_JOB_TYPE_SPARK,
        executorIP: "192.168.0.5"
    };

    await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(job);
    await db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(node);
    await db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(node2);
    await db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(node3);

    await jobsScheduler._errorJobs();

    let nodes = await mongo_helper.retrieveNodesStatus({_id: node2._id});
    expect(nodes[0].status).toEqual(Constants.EAE_SERVICE_STATUS_IDLE);

    nodes = await mongo_helper.retrieveNodesStatus({_id: node3._id});
    expect(nodes[0].status).toEqual(Constants.EAE_SERVICE_STATUS_IDLE);
});

test('_canceledOrDoneJobs: job in canceled state gets set to completed', async () => {
    let canceledJob = {
        status: [Constants.EAE_JOB_STATUS_CANCELLED],
        statusLock: false,
    };

    await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(canceledJob);

    await jobsScheduler._canceledOrDoneJobs();

    let jobs = await mongo_helper.retrieveJobs({});
    expect(jobs[0].status[0]).toEqual(Constants.EAE_JOB_STATUS_COMPLETED);
});

test('_canceledOrDoneJobs: job in done state gets set to completed', async () => {
    let doneJob = {
        status: [Constants.EAE_JOB_STATUS_DONE],
        statusLock: false,
    };

    await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(doneJob);

    await jobsScheduler._canceledOrDoneJobs();

    let jobs = await mongo_helper.retrieveJobs({});
    expect(jobs[0].status[0]).toEqual(Constants.EAE_JOB_STATUS_COMPLETED);
});
