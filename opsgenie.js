var debug = require('debug')('shim');

var sdk = require('opsgenie-sdk');

var apiKey = process.env.OPSGENIE_API_KEY;

if (!apiKey) {
    console.error('Please provide the OPSGENIE_API_KEY environment variable.');
    process.exit(1);
}

sdk.configure({
    api_key: apiKey
});

exports.vropsAlertToOpsGenieAlert = function (vropsAlert, callback) {
    debug('vROps alert:', JSON.stringify(vropsAlert));

    var opsgenieAlert = {
        message: vropsAlert.alertName,
        details: {
            vropsAlert: vropsAlert
        }
        teams: ['ops_team']
    };

    sdk.alert.create(opsgenieAlert, function (err, alert) {
        debug('Opsgenie alert:', JSON.stringify(alert));

        return callback(err, alert); 
    });
};

