const { Constants } =  require('eae-utils');
let NodesWatchdogTestServer = require('./nodesWatchdogTestServer.js');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

let nodesWatchdogTestServer = new NodesWatchdogTestServer();

beforeEach(() => {
    return nodesWatchdogTestServer.setup();
});

afterAll(function ()  {
    return nodesWatchdogTestServer.shutdown();
});

test('Dead nodes are invalidated by setting their locks to true', async () => {
    let node = {
        status: Constants.EAE_SERVICE_STATUS_DEAD,
        statusLock: false
    };

    await nodesWatchdogTestServer.insertNode(node);
    await nodesWatchdogTestServer.nodesWatchdog._invalidateDead();

    let nodes = await nodesWatchdogTestServer.mongo_helper.retrieveNodesStatus({_id: node._id});

    expect(nodes.length).toBe(1);
    expect(nodes[0].statusLock).toEqual(true);
});
