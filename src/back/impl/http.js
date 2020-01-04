const mine_types = require('mime-types');

/**
 * @type import("../file")
 */
let File;

exports.DI = function (_File) {
    File = _File;
};


function rewritePath(url) {
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



function handleHttp(request, response) {
    request.on('error', () => {
        response.statusCode = 400;
        response.end('400');
    });
    response.on('error', () => {
    });

    const path = rewritePath(request.url);

    if (!path) {
        response.statusCode = 403;
        response.end('403');
        return;
    }

    File.readFile(path).then((data) => {
        response.writeHead(200, getHeader(request.url));
        response.end(data);
    }).catch(() => {
        response.statusCode = 404;
        response.end('');
    });
}

exports.rewritePath = rewritePath;
exports.handleHttp = handleHttp;
