const socketio = require('socket.io');
const Logger = require('./logger');
const SocketState = require('./socketstate');
const SocketEmitter = require('./socketemitter');

export function setup(server) {
    socketio.listen(server).sockets.on('connection', (socket) => {
        Logger.log('join ' + socket.id);

        const state = new SocketState.ConnectionState(new SocketEmitter.Emitter(socket));

        socket.on('disconnect', state.handleDisconnect);
        socket.on('c2s_getCatalog', state.handleGetCatalog);
        socket.on('c2s_submit', state.handleSubmmit);
        socket.on('c2s_halt', state.handleHalt);

        // テスト用
        socket.on('c2s_echo', (data) => {
            Logger.log('echo :' + data.msg);
            socket.emit('s2c_echo', {
                msg: !data.msg ? 'Hello!' : data.msg.toUpperCase()
            });
        });

    });
}