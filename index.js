var debug = require('debug')('http');

var https = require('https');
var fs = require('fs');

var opsgenie = require('./opsgenie');

var port = process.env.PORT || 3000;

var options = {
    key: fs.readFileSync('server.pem'),
    cert: fs.readFileSync('server.pem')
};

https.createServer(options, (req, res) => {

    debug(req.method + ' ' + req.url);

    var body = '';

    req.on('data', (data) => {
        body += data.toString();
    });

    req.on('end', () => {

        var statusCode = 200;

        if (req.method === 'POST') {
            statusCode = 201;
        } else if (req.method === 'PUT') {
            statusCode = 202;
        } else {
            return sendResponse(res, 400, '{ error: "Unsupported method: ' + req.method + '" }');
        }

        if (!body) {
            return sendResponse(res, 400, '{ error: "The request payload must not be empty" }');
        }

        try {
            debug('raw body: ' + body);

            var jsonBody = JSON.parse(body);
            opsgenie.vropsAlertToOpsGenieAlert(jsonBody, (err, alert) => {
                if (err) { return sendResponse(res, 500, err); }
                return sendResponse(res, statusCode, alert);
            });
        } catch (err) {
            return sendResponse(res, 500, err);
        }
    });

}).listen(port);

function sendResponse(res, statusCode, response) {
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

console.log('Listening on port: ' + port);
