/**
 * @type typeof import("../taskimporter")
 */
let TaskImporter;
/**
 * @type typeof import("../JobExecutor")
 */
let JobExecutor;


function DI(_TaskImporter, _JobExecutor) {
    TaskImporter = _TaskImporter;
    JobExecutor = _JobExecutor;
}


class ConnectionState {

    constructor(_emitter, _socketid) {
        this.emitter = _emitter;
        this.auth = true;
        this.killer = null;
        this.socketid = _socketid;
    }

    //

    kill() {
        if (this.killer !== null) {
            this.killer();
            this.emitter.emitProgress('halted', { msg: 'accepted (halt)' });
        }
    }

    isAuthorized() {
        return this.auth;
    }

    //

    handleDisconnect() {
        this.kill();
    }

    handleGetCatalog(listener) { // TODO: refactor me
        listener(TaskImporter.allLangInfo);
    }

    handleSubmmit(data) {
        if (!this.isAuthorized()) return;
        this.kill();

        data.socketid = this.socketid;
        JobExecutor.pushJob(data, (type, json) => {
            if (json.killer !== undefined) {
                this.killer = json.killer;
                json.killer = undefined;
            }
            this.emitter.emitProgress(type, json);
        });
    }

    handleHalt() {
        if (!this.isAuthorized()) return;
        this.kill();
    }
}


exports.DI = DI;
exports.ConnectionState = ConnectionState;
