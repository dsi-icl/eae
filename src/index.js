var express = require('express');
var os = require('os');
var app = express();

var config = require('../config/eae.scheduler.config.js');
var EaeScheduler = require('./eaeScheduler.js');

//Remove unwanted express headers
app.set('x-powered-by', false);

var options = Object.assign({}, config);
app.use(EaeScheduler(options));

app.listen(config.port, function (err) {
    if (err) {
        console.error(err); // eslint-disable-line no-console
        return;
    }

    console.log(`Listening at http://${os.hostname()}:${config.port}/`); // eslint-disable-line no-console
});
