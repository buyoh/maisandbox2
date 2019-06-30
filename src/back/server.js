const socketio = require('socket.io');

const TaskExecutor = require('./taskexecutor');
const Validator = require('./validator');

//

require('./temperaser');

//

const settings = require('./settings').settings;
console.log('port: ' + settings.portno);

//

// http server
const server = require('./http').server;

// socketio
let soio = socketio.listen(server);

soio.sockets.on('connection', (socket) => {
    console.log('join ' + socket.id);
    let killer = null;
    let auth = true; // impl

    // テスト用
    socket.on('c2s_echo', (data) => {
        console.log('echo :' + data.msg);
        socket.emit('s2c_echo', {
            msg: !data.msg ? 'Hello!' : data.msg.toUpperCase()
        });
    });

    socket.on('disconnect', () => {});

    // 言語情報等を取得する
    socket.on('c2s_getCatalog', (listener) => {
        listener(TaskExecutor.allLangInfo);
    });

    // コード提出
    socket.on('c2s_submit', (data) => {
        if (!auth) return;
        if (killer)
            killer();
        if (!Validator.checkTaskSubmission(data)) {
            socket.emit('s2c_progress', {
                type: 'error',
                data: {}
            });
            return;
        }
        data.socketid = socket.id;
        killer = TaskExecutor.pushTask(data, (type, json) => {
            if (json.killer !== undefined) {
                killer = json.killer;
                json.killer = undefined;
            }
            socket.emit('s2c_progress', {
                type: type,
                data: json
            });
        });
    });

    // 中断
    socket.on('c2s_halt', () => {
        if (!auth) return;
        if (killer !== null) {
            killer();
            socket.emit('s2c_progress', {
                type: 'halted',
                msg: 'accepted (halt)'
            });
        }
    });
});