const http = require('http');
const Impl = require('./impl/http');

export function setup(portno, hostname) {
    return http
        .createServer(new Impl.HttpResponser())
        .listen(portno, hostname);
}