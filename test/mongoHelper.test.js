const { Constants } =  require('eae-utils');
let MongoHelperTestServer = require('./mongoHelperTestServer.js');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

let mongoHelperTestServer = new MongoHelperTestServer();

beforeEach(() => {
    return mongoHelperTestServer.setup();
});

afterAll(function ()  {
    return mongoHelperTestServer.shutdown();
});

test('It can insert and retrieve nodes', async () => {
    let node = {};

    await mongoHelperTestServer.mongo_helper.insertNode(node);
    let nodes = await mongoHelperTestServer.mongo_helper.retrieveNodesStatus({});

    expect(nodes.length).toBe(1);
    expect(nodes[0]).toEqual(node);
});

test('It can retrieve jobs', async () => {
    let job1 = {
        executorIP: '1',
    };

    let job2 = {
        executorIP: '2',
    };

    await mongoHelperTestServer.mongo_helper._jobsCollection.insertOne(job1);
    await mongoHelperTestServer.mongo_helper._jobsCollection.insertOne(job2);
    let jobs = await mongoHelperTestServer.mongo_helper.retrieveJobs({executorIP: '1'});

    expect(jobs.length).toBe(1);
    expect(jobs[0]).toEqual(job1);
});
