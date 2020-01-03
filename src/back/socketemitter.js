export class Emitter {
    constructor(_socket) {
        this.socket = _socket;
    }

    emitProgress(type, json) {
        this.socket.emit('s2c_progress', {
            type: type,
            data: json
        });
    }

    emitEcho(msg) {
        this.socket.emit('s2c_echo', { msg });
    }
}
