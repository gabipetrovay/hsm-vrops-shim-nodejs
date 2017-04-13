var debug = require('debug')('shim');
var debugOG = require('debug')('opsgenie');

var sdk = require('opsgenie-sdk');

var apiKey = process.env.OPSGENIE_API_KEY;

// exit the process if no OpsGenie API key is set
if (!apiKey) {
    console.error('Please provide the OPSGENIE_API_KEY environment variable.');
    process.exit(1);
}

// build the OpsGenie configuration object
var config = {
    api_key: apiKey,
    maxAttempts: 1,
    strictSSL: false
};
if (process.env.http_proxy) {
    config.proxy = 'http://' + process.env.http_proxy;
}

// configure OpsGenie SDK
sdk.configure(config);
debugOG('OpsGenie configuration: ' + JSON.stringify(sdk.configuration));

/**
 * Given a vROps alert object, create an OpsGenie alert.
 */
exports.vropsAlertToOpsGenieAlert = function (vropsAlert, callback) {
    debug('vROps alert:', JSON.stringify(vropsAlert));

    var opsgenieAlert = {
        message: vropsAlert.alertName,
        description: vropsAlert.info,
        details: {
            vropsAlert: vropsAlert
        },
        teams: ['ops_team']
    };

    sdk.alert.create(opsgenieAlert, function (err, alert) {
        debug('OpsGenie alert:', JSON.stringify(alert));

        return callback(err, alert); 
    });
};

