// _____________________________________________________
// socket.js
// サーバ通信操作のwrapper

const io = require('socket.io-client');
const socket = io.connect();


// _____________________________________________________
// getter

export function getCatalog(callback) {
    socket.emit('c2s_getCatalog', callback);
}


// _____________________________________________________
// emitter

export function emitHalt() {
    socket.emit('c2s_halt');
}

export function emitSubmit(info) {
    socket.emit('c2s_submit', info);
}


// _____________________________________________________
// listener

export function addProgressListener(listener) {
    socket.on('s2c_progress', listener);
}

export function onConnect(callback) {
    socket.on('connect', callback);
}

export function onDisconnect(callback) {
    socket.on('disconnect', callback);
}
