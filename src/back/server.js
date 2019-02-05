const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const filetype = require('file-type')

const TaskExecutor = require('./taskexecutor');
const Validator = require('./validator');

require('./temperaser');

const settings = {
    portno: 11450
};

// read argv
for (let i = 2, m = null; i < process.argv.length; ++i){
    const arg = process.argv[i];
    if (arg == "--port") m = 1;
    else if (m == 1) settings.portno = +arg, m = null;
}


function rewritePath(url){
    if (url.match(/\.\./))
        return null;
    if (url === "/"){
        return "./src/front/media/sandbox.html";
    }
    else if (url[1] == "_"){
        let m = url.match(/^\/_\/(.*)$/);
        return "./build/" + m[1];
    }
    else{
        return "./src/front/media" + url;
    }
}


let server = http.createServer((request, responce)=> {
    request.on('error', (e)=>{
        console.error(e);
        responce.statusCode = 400;
        responce.end("400");
    });
    responce.on('error', (e)=>{
        console.error(e);
    });

    console.error("requested: "+request.url);

    // 必要に応じてurlを変換
    const path = rewritePath(request.url);

    if (!path){
        responce.statusCode = 403;
        responce.end("403");
        return;
    }

    // 該当するファイルを探す
    try{
        const cnt = fs.readFileSync(path, 'utf-8');
        responce.writeHead(200, filetype(request.url));
        responce.end(cnt);
        console.error("requested: lookup "+path+" => ok");
    }
    catch(err){
        responce.statusCode = 404;
        responce.end("404");
        console.error("requested: lookup "+path+" => ng");
    }

}).listen(settings.portno);  // ポート競合の場合は値を変更
console.log("port: "+settings.portno);



// socketio
let soio = socketio.listen(server);

soio.sockets.on('connection', (socket)=> {
    console.log("join "+socket.id);

    let killer = null;

    // テスト用
    socket.on('c2s_echo', (data)=> {
        console.log("echo :" + data.msg);
        socket.emit('s2c_echo', {msg: !data.msg ? "Hello!" : data.msg.toUpperCase()});
    });

    // 言語情報等を取得する
    socket.on('c2s_getCatalog', (listener)=> {
        listener(TaskExecutor.allLangInfo);
        // listener({
        //     taskTypeList: TaskExecutor.langList,
        //     recipes: TaskExecutor.allRecipes,
        //     options: TaskExecutor.allOptions
        // });
    });

    // コード提出
    socket.on('c2s_submit', (data)=> {
        if (killer)
            killer();
        if (!Validator.checkTaskSubmission(data)){
            socket.emit('s2c_progress', {type:'error', data:{}});
            return;
        }
        data.socketid = socket.id;
        killer = TaskExecutor.pushTask(data, (type, json)=> {
            if (json.killer !== undefined){
                killer = json.killer;
                json.killer = undefined;
            }
            socket.emit('s2c_progress', {type:type, data:json});
        });
    });
    
    // 中断
    socket.on('c2s_halt', ()=> {
        if (killer !== null)
            killer();
        socket.emit('s2c_progress', {type:'halted', msg:'accepted (halt)'});
    });

    socket.on('disconnect', ()=> { });
});


