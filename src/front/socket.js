// _____________________________________________________
// socket.js
// サーバ通信操作のwrapper

const socket = io.connect();
const progressListener = [];

socket.on("s2c_progress", (json)=>{
    for (let f of progressListener)
        f(json);
});


// _____________________________________________________
// getter

export function getCatalog(callback){
    socket.emit("c2s_getCatalog", callback);
}


// _____________________________________________________
// emitter

export function emitHalt(){
    socket.emit("c2s_halt");
}

export function emitSubmit(info){
    socket.emit("c2s_submit", info);
}


// _____________________________________________________
// listener

export function addProgressListener(listener){
    progressListener.push(listener);
}
