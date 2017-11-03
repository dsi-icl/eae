const { Constants } =  require('eae-utils');
const mongodb = require('mongodb').MongoClient;
const MongoHelper = require('../src/mongoHelper');
let JobsScheduler = require('../src/jobsScheduler.js');

var mongoURL = 'mongodb://localhost:27017';
var db = null;
var mongo_helper = null;
var jobsScheduler = null;
var options = {
    keepAlive: 30000, connectTimeoutMS: 30000,
};

beforeEach(() => {
    console.log("Before all");

    return new Promise(function (resolve, reject) {
        mongodb.connect(mongoURL, options, function (err, mongo) {
            db = mongo;
            db.createCollection(Constants.EAE_COLLECTION_JOBS).then(() => {
                console.log("Jobs collection created if it didn't exist");
                db.createCollection(Constants.EAE_COLLECTION_STATUS).then(() => {
                    console.log("Status collection created if it didn't exist");
                    db.collection(Constants.EAE_COLLECTION_JOBS).deleteMany({}).then(() => {
                        console.log("Cleared jobs collection");
                        db.collection(Constants.EAE_COLLECTION_STATUS).deleteMany({}).then(() => {
                            console.log("Cleared status collection");
                            let worker = {
                                status: Constants.EAE_SERVICE_STATUS_IDLE,
                                computeType: "r",
                                statusLock: false
                            };

                            db.collection(Constants.EAE_COLLECTION_STATUS).insertOne(worker).then(() => {
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

afterAll(function ()  {
    return new Promise(function (resolve, reject) {
        db.close();
        console.log("Resolved afterEach()");
        resolve(true);
    });
});

//TODO(emanuelerossi): Make sure the test work after we have a computer service on during tests and we make requests to it in jobsScheduler
test('_queued_jobs: A queued non-spark job gets scheduled', async () => {
    expect.assertions(1);

    let job = {
        status: [Constants.EAE_JOB_STATUS_QUEUED],
        type: "r",
        statusLock: false
    };

    await db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(job);

    await jobsScheduler._queuedJobs();

    let jobs = await mongo_helper.retrieveJobs({_id: job._id});
    expect(jobs[0].status).toEqual([Constants.EAE_JOB_STATUS_QUEUED, Constants.EAE_JOB_STATUS_SCHEDULED]);
});

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
    expect.assertions(4);

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
