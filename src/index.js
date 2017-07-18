var express = require('express');
var app = express();

var config = require('../config/eae.compute.config.js');
var EaeCompute = require('./eaeCompute.js');

//Remove unwanted express headers
app.set('x-powered-by', false);

var options = Object.assign({}, config);
app.use(EaeCompute(options));

app.listen(config.port, function (err) {
    if (err) {
        console.error(err);
        return;
    }

    console.log(`Listening at http://localhost:${config.port}/`);
});
