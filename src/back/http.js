const fs = require('fs');
const mimeTypes = require('mime-types');
const http = require('http');

const settings = require('./settings').settings;


function rewritePath(url) {
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


exports.server = http.createServer((request, response) => {
    request.on('error', (e) => {
        console.error(e);
        response.statusCode = 400;
        response.end('400');
    });
    response.on('error', (e) => {
        console.error(e);
    });

    console.error('requested: ' + request.url);

    // 必要に応じてurlを変換
    const path = rewritePath(request.url);

    if (!path) {
        response.statusCode = 403;
        response.end('403');
        return;
    }

    // 該当するファイルを探す
    try {
        const cnt = fs.readFileSync(path, 'utf-8');
        response.writeHead(200, { 'Content-Type': mimeTypes.lookup(request.url) });
        response.end(cnt);
        console.error('requested: lookup ' + path + ' => ok');
    } catch (err) {
        response.statusCode = 404;
        response.end('');
        console.error('requested: lookup ' + path + ' => ng');
    }

}).listen(settings.portno, settings.hostname);
