const socketio = require('socket.io');
const Logger = require('./logger');
const SocketState = require('./socketstate');
const SocketEmitter = require('./socketemitter');

exports.setup = function (server) {
    socketio.listen(server).sockets.on('connection', (socket) => {
        Logger.log('join ' + socket.id);

        const state = new SocketState.ConnectionState(
            new SocketEmitter.Emitter(socket),
            socket.id
        );

        socket.on('disconnect', (...a) => state.handleDisconnect(...a));
        socket.on('c2s_getCatalog', (...a) => state.handleGetCatalog(...a));
        socket.on('c2s_submit', (...a) => state.handleSubmmit(...a));
        socket.on('c2s_halt', (...a) => state.handleHalt(...a));

        // テスト用
        socket.on('c2s_echo', (data) => {
            Logger.log('echo :' + data.msg);
            socket.emit('s2c_echo', {
                msg: !data.msg ? 'Hello!' : data.msg.toUpperCase()
            });
        });

    });
};