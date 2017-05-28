var debug = require('debug')('shim');

var request = require('request');

var config = require('./config');


exports.correlateAlerts = function (vropsAlert, opsgenieAlert, callback) {

    // TODO Work around this this required
    debug('TODO: Workaround required: https://jira.swisscom.com/browse/CLOUDENT-3520');

    // the body below contains a theoretical sample correlation if the API behavior would be correct
    request({
        method: 'POST',
        url: 'https://' + config.vrops.apiEndpointFqdn + '/suite-api/api/alerts/' + vropsAlert.alertId + '/notes',
        json: true,
        body: {
            'type': 'SYSTEM',
            'note': 'opsgenie.id=' + opsgenieAlert.id,
            'links': [{
                'href': 'https://app.opsgenie.com/alert/V2#/show/' + opsgenieAlert.id + '/details',
                'name': 'OpsGenie Alert'
            }],
            'extension': {
                'anyAttributes': 'test attribute',
                'anyObjects': ['test', { 'an': 'object' }]
            }
        },

    }, (err, response, body) => {
        if (err || !response || response.statusCode !== 201) {
            return callback(err || 'Did not receive a response with status 201 from vROps');
        }
        debug('vROps response: ' + JSON.stringify(body));
        callback(null);
        return;
    });
};
