const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const filetype = require('file-type')

let server = http.createServer(function(request, responce) {
    request.on('error', function(e){
        console.error(e);
        responce.statusCode = 400;
        responce.end("400");
    });
    responce.on('error', function(e){
        console.error(e);
    });
    // !unsafe!
    let path = "src/front/media" + request.url;
    if (request.url[1] == "_"){
        let m = request.url.match(/^\/_\/(.*)$/);
        path = "build/" + m[1];
    }
    console.error("requested: "+request.url);
    console.error("requested: lookup "+path);

    if (!request.url.match(/\.\./) && fs.existsSync(path)){
        responce.writeHead(200, filetype(request.url));
        responce.end(fs.readFileSync(path, 'utf-8'));
    }else{
        responce.statusCode = 404;
        responce.end("404");
    }
}).listen(11450);  // ポート競合の場合は値を変更
 
console.log("port: 11450");