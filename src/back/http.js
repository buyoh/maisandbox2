const http = require('http');
const File = require('./file');
const Impl = require('./impl/http');
Impl.DI(File);

function setup(portno, hostname) {
    return http
        .createServer((req, res) => Impl.handleHttp(req, res))
        .listen(portno, hostname);
}

exports.setup = setup;
