 //---------------------------------------------------------------------
 // <copyright file="togglButtonForm.js">
 //    This code is licensed under the MIT License.
 //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
 //    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 //    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 //    PARTICULAR PURPOSE AND NONINFRINGEMENT.
 // </copyright>
 // <summary>Routes and some logic for togglButtonForm server actions</summary>
 //---------------------------------------------------------------------

var express = require('express');
var router = express.Router();

/* GET toggl button form. */
router.get('/', function (req, res, next) {
    res.render('togglButtonForm', {});
});

router.get('/getUserData', function (req, res, next) {
    var https = require('https');
    var options = {
        host: 'api.track.toggl.com',
        path: '/api/v8/me?with_related_data=true',
        headers: { 'Authorization': 'Basic ' + new Buffer(req.query['apikey'] + ':api_token').toString('base64') },
    };

    var togglReq = https.request(options, function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log('status: ' + this.statusCode + ' - ' + this.statusMessage);
            //console.log(str);
            if (this.statusCode === 200) {
				res.send(JSON.parse(str).data);
            }
            else
                res.sendStatus(this.statusCode);
        })
    }).end();
});

router.put('/stopTimer', function(req, res, next){
    var https = require('https');

    var options = {
        host: 'api.track.toggl.com',
        path: '/api/v8/time_entries/' + req.body.timeEntryId + '/stop',
        headers: { 'Authorization': 'Basic ' + new Buffer(req.body.apikey + ':api_token').toString('base64'),
                   'Content-Type': 'application/json' },
        method: 'PUT'
    };
    
    var togglReq = https.request(options, function(response){
        var str = '';
        
        response.on('data', function(chunk){ 
            str += chunk;
        });
        
        response.on('end', function(){
            res.sendStatus(this.statusCode);
        }); 
    });
    
    togglReq.end();    
});

router.delete('/discardTimer', function(req, res, next){
    var https = require('https');
    
    var options = {
        host: 'api.track.toggl.com',
        path: '/api/v8/time_entries/' + req.body.timeEntryId,
        headers: { 'Authorization': 'Basic ' + new Buffer(req.body.apikey + ':api_token').toString('base64'),
                   'Content-Type': 'application/json' },
        method: 'DELETE'
    };
    
    var togglReq = https.request(options, function(response){
        var str = '';
        
        response.on('data', function(chunk){ 
            str += chunk;
        });

        response.on('end', function(){
            console.log('end');
            res.sendStatus(this.statusCode);
        }); 
    });
    
    togglReq.end();    
});



router.post('/startTimer', function (req, res, next) {
    if (req.method != 'POST'){
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end();        
    }

    if (req.body.length > 1e6){
        res.writeHead(413, {'Content-Type': 'text/plain'});
    }
    
    var https = require('https');

    var timeEntry = JSON.stringify({
        "time_entry": {
            "description": req.body.activityDescription,
            "tags": req.body.tags.split(','),
            "pid": req.body.project,
            "created_with": "Visual Studio Team Services    "
        }});
    
    var options = {
        host: 'api.track.toggl.com',
        path: '/api/v8/time_entries/start',
        headers: {
            'Authorization': 'Basic ' + new Buffer(req.body.apikey + ':api_token').toString('base64'),
            'Content-Type': 'application/json'
        },
        method: 'POST'
    };

    var togglReq = https.request(options, function(response){
        var str = '';
        // console.log('inside callback');
        
        response.on('data', function(chunk){ 
            str += chunk;
            // console.log('data: ' + str);
        });
        
        response.on('end', function(){
           // console.log('End Request: ' + this.statusCode + ' - ' + this.statusMessage);
           res.sendStatus(this.statusCode);
        });
    });
    
    togglReq.write(timeEntry);
    togglReq.end();
});

module.exports = router;