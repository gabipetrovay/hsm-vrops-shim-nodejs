var https = require('https');
var fs = require('fs');

var port = process.env.PORT || 3000;

var options = {
    key: fs.readFileSync('server.pem'),
    cert: fs.readFileSync('server.pem')
};

https.createServer(options, function (req, res) {
    console.log(req.method, req.url);
    var statusCode = 200;
    if (req.method === 'POST') {
        statusCode = 201;
    } else if (req.method === 'PUT') {
        statusCode = 202;
    }
    res.writeHead(statusCode);
    res.end("hello world\n");
}).listen(port);

console.log('Listening on port: ' + port);
