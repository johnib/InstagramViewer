var express = require('express'),
    morgan = require('morgan');

var app = express();
app.use(morgan('combined'));

app.post('/oauth/access_token', function (req, res) {
    console.log(req.headers);

    var body = "";
    req.on('data', function (data) {
        body += data.toString();
    });

    req.on('end', function () {
        console.log(body);
    });

    res.end("200");
});

app.listen(4000);