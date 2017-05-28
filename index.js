var debug = require('debug')('shim:http');

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

        debug('HTTP headers: ' + JSON.stringify(req.headers));

        if (!body) {
            return sendResponse(res, 400, 'The request payload must not be empty');
        }

        try {
            debug('HTTP body: ' + body);
            req.body = JSON.parse(body);
        } catch (err) {
            return sendResponse(res, 500, err);
        }

        // if no vROps API endpoint is provided, try to detect the HTTP request origin
        if (!config.vrops.apiEndpointFqdn) {
            var origin = findHttpOrigin(req, config);
            if (origin) {
                req.vropsApiEndpoint = origin;
                debug('Using the HTTP origin as the vROps API endpoint: ' + req.vropsApiEndpoint);
            } else {
                return sendResponse(res, 500, 'Could not determine the HTTP origin from this request using the socket remote address: ' + req.socket.remoteAddress);
            }
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
debug('Listening on port: ' + config.https.port);

function postHandler (req, res) {
    var statusCode = 201;
    var vropsAlert = req.body;

    console.log('New vROps alert: ' + vropsAlert.alertId + ' (' + vropsAlert.alertName + ')');

    opsgenie.createAlert(vropsAlert, (err, opsgenieAlert) => {
        if (err) { return sendResponse(res, err.httpStatusCode || 500, err.error || err); }

        console.log('OpsGenie alert ' + opsgenieAlert.alertId + ' created for vROps alert ' + vropsAlert.alertId);

        var options = {
            apiEndpoint: req.vropsApiEndpoint
        }
        vrops.correlateAlerts(vropsAlert, opsgenieAlert, options, err => {
            // TODO this correlation is currently not working
            //if (err) { return sendResponse(res, 500, err); }
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

    console.log('Canceled vROps alert: ' + vropsAlert.alertId + ' (' + vropsAlert.alertName + ')');

    opsgenie.cancelAlert(vropsAlert, (err, opsgenieAlert) => {
        if (err) { return sendResponse(res, err.httpStatusCode || 500, err.error || err); }
        console.log('OpsGenie alert ' + opsgenieAlert.id + ' canceled for vROps alert ' + vropsAlert.alertId);
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

function findHttpOrigin (req, config) {
    var origin = req.socket.remoteAddress.match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/);
    if (origin) {
        return origin[0];
    } else if (req.socket.remoteAddress === '::1') {
        return '127.0.0.1';
    }
    return undefined;
}
