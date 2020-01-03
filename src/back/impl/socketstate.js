/**
 * @type typeof import("../taskimporter")
 */
let TaskImporter;
/**
 * @type typeof import("../JobExecutor")
 */
let JobExecutor;

export function DI(_TaskImporter, _JobExecutor) {
    TaskImporter = _TaskImporter;
    JobExecutor = _JobExecutor;
}

export class ConnectionState {

    constructor(_emitter) {
        this.emitter = _emitter;
        this.auth = true;
        this.killer = null;
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

        data.socketid = this.socket.id;
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