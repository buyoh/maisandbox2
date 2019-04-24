const fs = require('fs');
const filetype = require('file-type');
const http = require('http');

const settings = require('./settings').settings;


function rewritePath(url) {
    if (url.match(/\.\./))
        return null;
    if (url === "/") {
        return "./src/front/media/sandbox.html";
    } else if (url[1] == "_") {
        let m = url.match(/^\/_\/(.*)$/);
        return "./build/" + m[1];
    } else {
        return "./src/front/media" + url;
    }
}


exports.server = http.createServer((request, responce) => {
    request.on('error', (e) => {
        console.error(e);
        responce.statusCode = 400;
        responce.end("400");
    });
    responce.on('error', (e) => {
        console.error(e);
    });

    console.error("requested: " + request.url);

    // 必要に応じてurlを変換
    const path = rewritePath(request.url);

    if (!path) {
        responce.statusCode = 403;
        responce.end("403");
        return;
    }

    // 該当するファイルを探す
    try {
        const cnt = fs.readFileSync(path, 'utf-8');
        responce.writeHead(200, filetype(request.url));
        responce.end(cnt);
        console.error("requested: lookup " + path + " => ok");
    } catch (err) {
        responce.statusCode = 404;
        responce.end("404");
        console.error("requested: lookup " + path + " => ng");
    }

}).listen(settings.portno, settings.hostname);
