var debug = require('debug')('http');

var https = require('https');

var config = require('./config');
var opsgenie = require('./opsgenie');
var vrops = require('./vrops');


https.createServer(config.https, (req, res) => {

    debug(req.method + ' ' + req.url);

    var body = '';

    req.on('data', (data) => {
        body += data.toString();
    });

    req.on('end', () => {

        if (!body) {
            return sendResponse(res, 400, '{ error: "The request payload must not be empty" }');
        }

        try {
            debug('raw body: ' + body);
            req.body = JSON.parse(body);
        } catch (err) {
            return sendResponse(res, 500, err);
        }

        if (req.method === 'POST') {
            postHandler(req, res);
            return;
        } else {
            putHandler(req, res);
            return;
        }
    });
}).listen(config.https, config.https.port);
console.log('Listening on port: ' + config.https.port);

function postHandler (req, res) {
    var statusCode = 201;
    var vropsAlert = req.body;

    opsgenie.createAlert(vropsAlert, (err, opsgenieAlert) => {
        if (err) { return sendResponse(res, 500, err); }

        vrops.correlateAlerts(vropsAlert, opsgenieAlert, err => {
            if (err) { return sendResponse(res, 500, err); }
            return sendResponse(res, statusCode, opsgenieAlert);
        });
    });
}

function putHandler (req, res) {
    var statusCode = 202;
    var vropsAlert = req.body;

    if (!req.body.cancelDate) {
        var error = 'Alert updates are not completely supported. All alert updates except cancel operations are ignored.';
        debug('TODO: ' + error);
        return sendResponse(res, 501, new Error(error));
    }

    opsgenie.cancelAlert(vropsAlert, (err, opsgenieAlert) => {
        if (err) { return sendResponse(res, err.httpStatusCode || 500, err.error || err); }
        return sendResponse(res, statusCode, opsgenieAlert);
    });
}

function sendResponse (res, statusCode, response) {
    if (typeof response === 'object') {
        if (response instanceof Error) {
            response = { error: response.toString() };
        }
        response = JSON.stringify(response);
    }
    debug(statusCode >= 300 ? 'Error:' : 'Response:', statusCode, response);
    res.writeHead(statusCode);
    res.end(response);
}
