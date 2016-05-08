"use strict";

// deps
var express = require('express'),
    https = require('http'),
    q = require('q'),
    FormData = require('form-data'),
    aws = require('aws-sdk'),
    morgan = require('morgan');

// vars
var client_id = process.env.clientId,
    client_secret = process.env.clientSecret,
    redirect_uri = process.env.redirectUri,
    apiUrl = "https://api.instagram.com/oauth/authorize/?client_id="
        .concat(client_id, "&redirect_uri=", redirect_uri, "&response_type=code");

console.log(apiUrl);

var app = express();
app.use(morgan('combined'));


app.get('/', function (req, res) {
    res.redirect(apiUrl);
});

app.get('/post-auth', function (req, res) {
    var code = req.query.code;
    console.log(code);

    getAccessTokenUsing(code)
        .then(function (data) {
            console.log(data);
            res.end("200");
        })
        .catch(function (err) {
            console.error(err);
            res.end("500");
        });
});

function getAccessTokenUsing(code) {
    var defer = q.defer(),
        form = new FormData(),
        options = {
            host: "api.instagram.com",
            port: 443,
            // host: "127.0.0.1",
            // port: 4000,
            path: "/oauth/access_token",
            method: "POST",
            headers: form.getHeaders()
        };

    form.append("client_id", client_id);
    form.append("client_secret", client_secret);
    form.append("grant_type", "authorization_code");
    form.append("redirect_uri", redirect_uri);
    form.append("code", code);

    var request = https.request(options, function (res) {
        var statusCode = res.statusCode;

        var body;
        res.on('data', function (data) {
            body += data.toString();
        });

        res.on('end', function () {
            if (statusCode != 200) {
                defer.reject(body);
            } else {
                defer.resolve(body);
            }
        });

        res.on('error', function (err) {
            defer.reject(err);
        })
    });
    form.pipe(request);
    request.end();

    return defer.promise;
}

app.listen(process.env.PORT || 3000);