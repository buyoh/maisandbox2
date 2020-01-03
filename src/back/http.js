const http = require('http');
const Impl = require('./impl/http');

function setup(portno, hostname) {
    const hr = new Impl.HttpResponser();
    return http
        .createServer((req, res) => hr.handle(req, res))
        .listen(portno, hostname);
}

exports.setup = setup;
