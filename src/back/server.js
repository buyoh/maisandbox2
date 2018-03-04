const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const filetype = require('file-type')

const taskexecutor = require('./taskexecutor');
const validator = require('./validator');

const portno = 11450;

function isExistFile(path){
    try{
        fs.statSync(path);
        return true;
    }catch(err){
        return false;
    }
}

let server = http.createServer(function(request, responce) {
    request.on('error', function(e){
        console.error(e);
        responce.statusCode = 400;
        responce.end("400");
    });
    responce.on('error', function(e){
        console.error(e);
    });

    // 必要に応じてurlを変換
    let path = "src/front/media" + request.url;
    if (request.url[1] == "_"){
        let m = request.url.match(/^\/_\/(.*)$/);
        path = "build/" + m[1];
    }
    console.error("requested: "+request.url);

    // 該当するファイルを探す
    let ok = false;
    try{
        if (!request.url.match(/\.\./)){
            responce.writeHead(200, filetype(request.url));
            responce.end(fs.readFileSync(path, 'utf-8'));
            ok = true;
        }
    }catch(err){}

    // 404
    if (!ok) {
        responce.statusCode = 404;
        responce.end("404");
    }
    console.error("requested: lookup "+path+" => "+ok);

}).listen(portno);  // ポート競合の場合は値を変更
console.log("port: "+portno);



// socketio
let soio = socketio.listen(server);

soio.sockets.on('connection', function(socket) {
    console.log("join "+socket.id);

    // テスト用
    socket.on('c2s_echo', function(data) {
        console.log("echo :" + data.msg);
        socket.emit('s2c_echo', {msg: !data.msg ? "Hello!" : data.msg.toUpperCase()});
    });

    socket.on('c2s_getCatalog', function(data) {
        socket.emit('s2c_catalog', {
            taskTypeList: taskexecutor.taskTypeList
        });
    });

    // コード提出
    socket.on('c2s_submit', function(data){
        data.socketid = socket.id;
        taskexecutor.pushTask(data, function(type, json){
            socket.emit('s2c_progress', {type:type, data:json});
        });
    });

    socket.on('disconnect', function() {
    });
});


