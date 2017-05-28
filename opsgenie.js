var debug = require('debug')('opsgenie');

var sdk = require('opsgenie-sdk');

var config = require('./config');


// build the OpsGenie configuration object
var opsgenieConfig = {
    api_key: config.opsgenie.apiKey,
};

// configure OpsGenie SDK
sdk.configure(opsgenieConfig);
debug('OpsGenie configuration: ' + JSON.stringify(sdk.configuration));

/**
 * Create an OpsGenie alert given a vROps alert object.
 *
 * The vROps alert ID will be saved as alias in OpsGenie.
 */
exports.createAlert = function (vropsAlert, callback) {
    debug('vROps alert:', JSON.stringify(vropsAlert));

    var opsgenieAlert = {
        // only test alerts should have no name and hence creating a test alert
        message: vropsAlert.alertName || 'Test alert',
        description: vropsAlert.info,
        alias: vropsAlert.alertId
    };

    sdk.alert.create(opsgenieAlert, buildOptions(), (err, alert) => {
        if (err) { return callback(err); }
        debug('OpsGenie created alert: ', JSON.stringify(alert));
        return callback(null, alert);
    });
};

/**
 * Cancel an OpsGenie alert given a vROps alert object.
 *
 * This will search the OpsGenie alert with the alias equal to the vROps alert ID.
 */
exports.cancelAlert = function (vropsAlert, callback) {
    debug('vROps alert:', JSON.stringify(vropsAlert));

    sdk.alert.close({ alias: vropsAlert.alertId }, buildOptions(), function (err, alert) {
        if (err) { return callback(err); }
        debug('OpsGenie canceled alert: ', JSON.stringify(alert));
        return callback(null, alert);
    });
};

function buildOptions () {
    var options = {
        strictSSL: false
    };
    if (process.env.http_proxy) {
        debug('Detected http_proxy: ' + process.env.http_proxy);
        options.proxy = 'http://' + process.env.http_proxy;
    }
    debug('Using the following OpsGenie request options: ' + JSON.stringify(options));
    return options;
}
