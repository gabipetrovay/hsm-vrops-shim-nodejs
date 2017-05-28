var debug = require('debug')('config');

var fs = require('fs');


// report the use of default values
if (!process.env.HTTPS_SERVER_PEM_FILE) {
    console.error('Missing HTTPS_SERVER_PEM_FILE environment variable. Reading the default HTTPS certificate from: server.pem');
}
if (!process.env.HTTPS_PORT) {
    console.error('Missing HTTPS_PORT environment variable. The default HTTPS port 3000 will be used to listen for incomming requests.');
}

var config = {
    https: {
        port: process.env.HTTPS_PORT || 3000,
        key: fs.readFileSync(process.env.HTTPS_SERVER_PEM_FILE || 'server.pem'),
        cert: fs.readFileSync(process.env.HTTPS_SERVER_PEM_FILE || 'server.pem')
    },
    opsgenie: {
        apiKey: process.env.OPSGENIE_API_KEY
    },
    vrops: {
        apiEndpointFqdn: process.env.VROPS_API_ENDPOINT_FQDN
    }
};

// sanity checks
if (!config.https.key || !config.https.cert) {
    console.error('Incorrect HTTPS server certificate configuration. Both the "https.key" and "https.cert" configuration keys must not be empty. User the HTTPS_SERVER_PEM_FILE environment variable to provide the path to a PEM file containing both the key and the certificate.');
    process.exit(10);
}
if (!config.opsgenie.apiKey) {
    console.error('Missing OPSGENIE_API_KEY environment variable. The OpsGenie API key cannot be empty.');
    process.exit(10);
}
if (!config.vrops.apiEndpointFqdn) {
    console.error('Missing VROPS_API_ENDPOINT_FQDN environment variable. The HTTP origin will be used as the vROps API endpoint.');
}

debug('Using shim configuration: ' + JSON.stringify(config, function (key, value) {
    // don't output private keys or certificates (here read as buffers from file)
    if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
        return 'Buffer(...)';
    }
    // don't output complete API keys in the debug information
    if (key === 'apiKey' && typeof value === 'string') {
        return value.substr(0, 5);
    }
    return value;
}));

module.exports = config;
