var http = require('http');
var path = require('path');

var express = require('express');

var express = require("express");
var session = require("express-session");
var process = require("process");
var router = express();

var CLIENT_ID = '*****';
var CLIENT_SECRET = '********************';
var SESSION_SECRET = '********************';
var CALLBACK_URL = '********************';

router.use(express.static(path.resolve(__dirname, 'layout')));

// initialize the Fitbit API client
var FitbitApiClient = require("fitbit-node");
var client = new FitbitApiClient(CLIENT_ID, CLIENT_SECRET);

router.use(session({ secret: SESSION_SECRET, cookie: { maxAge: 60000 }}));

router.get("/authorize", function (req, res) {
    res.redirect(client.getAuthorizeUrl('activity heartrate location nutrition profile settings sleep social weight',CALLBACK_URL));
});

router.get("/callback", function (req, res) {
   client.getAccessToken(req.query.code, CALLBACK_URL).then(function (result) {
        req.session.authorized = true;
        req.session.access_token = result.access_token;
        req.session.save();
        res.redirect("/");
    }).catch(function (error) {
        res.send(error);
    });
});

router.get("/logout", function(req, res) {
    req.session.authorized = false;
    req.session.access_token = null;
    req.session.save();
    res.redirect("/");  
})

router.get('/profile.json', function(req, res) {
    if (req.session.authorized) {
        client.get("/profile.json", req.session.access_token).then(function (results) {
            res.json(results[0]);
        });
    } else {
        res.status(403);
        res.json({ errors: [{ message: 'not authorized' }]});
    }
});

router.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log('server listening');
});