const fs = require('fs');
const mine_types = require('mime-types');


export function rewritePath(url) {
    // testable
    if (url.match(/\.\./))
        return null;
    if (url === '/') {
        return './src/front/media/sandbox.html';
    } else if (url[1] == '_') {
        let m = url.match(/^\/_\/(.*)$/);
        return './build/' + m[1];
    } else {
        return './src/front/media' + url;
    }
}


function getHeader(url) {
    return {
        'Content-Type': mine_types.lookup(url)
    };
}


function readFile(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, callback);
}

export class HttpResponser {
    constructor() {
        this.readFile = readFile;
    }

    handle(request, response) {
        request.on('error', () => {
            // console.error(e);
            response.statusCode = 400;
            response.end('400');
        });
        response.on('error', () => {
            // console.error(e);
        });

        // console.error('requested: ' + request.url);

        const path = rewritePath(request.url);

        if (!path) {
            response.statusCode = 403;
            response.end('403');
            return;
        }

        this.readFile(path, (err, data) => {
            if (err) {
                response.statusCode = 404;
                response.end('');
                // console.error('requested: lookup ' + path + ' => ng');
            }
            else {
                response.writeHead(200, getHeader(request.url));
                response.end(data);
                // console.error('requested: lookup ' + path + ' => ok');
            }
        });

    }
}