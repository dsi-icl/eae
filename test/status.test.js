let TestServer = require('./testserver.js');

let ts = new TestServer();
beforeAll(function() {
    return ts.run();
});

test('Dummy', function(done) {
    expect.assertions(1);
    expect(ts.mongo()).toBeDefined();
    done();
});

afterAll(function(){
   return ts.stop();
});

