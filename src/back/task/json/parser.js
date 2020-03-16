// かり

const fs = require('fs');

const Exec = require('./util/exec');
const FileWrapper = require('./util/filewrapper');
const DefaultTask = require('./util/default').generateDefaultTasks('cpp');


function replaceArgument(elem, task, opt) {
    if (!elem) return elem;
    if (elem[0] === '$') {
        return task.json.options[elem.substr(1, -1)];
    }
    else if (elem[0] === '#') {
        return opt[elem.substr(1, -1)];
    }
    else return elem;
}

// opt.env
// task.pickupInformations

// return (task, opt, cwdir, callback) => Promise
function parseAction(action) {
    if (action.cmd === 'exec') {
        return (task, opt, cwdir, callback) => {
            return new Promise((resolve, reject) => {
                const param = action.args.map(e => replaceArgument(e, task));

                const fin = action.stdin ? cwdir + replaceArgument(action.stdin, task, opt) : null;
                const fout = action.stdout ? cwdir + replaceArgument(action.stdout, task, opt) : null;
                const ferr = action.stderr ? cwdir + replaceArgument(action.stderr, task, opt) : null;

                let killer = Exec.spawn_fileio(
                    action.cmd, param, fin, fout, ferr, {
                        env: opt.env, //     PATH: FileWrapper.cygwinEnvPath
                        cwd: cwdir
                    },
                    (code, json) => {
                        DefaultTask.util.promiseResultResponser(json, cwdir, callback, task.pickupInformations)
                            .then(() => (code === 0) ? resolve() : reject());
                    }
                );

                callback.call(null, 'progress', {
                    killer: killer
                });
            });
        };
    }
    else if (action.cmd === 'nop') {
        return () => Promise.resolve();
    }
    else {
        throw new Error('unknown action command: ' + action.cmd);
    }
}

// TODO: solve eachcase

// return (task, opt, callback) => Promise
function parseActions(actions) {
    const pp = actions.map((a) => parseActions(a));
    return (task, opt, callback) => {
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);
        // construct Promise
        const promise = pp.reduce((p, action) => (p.then(action(task, opt, cwdir, callback))), Promise.resolve());
        promise.catch((e) => {
            DefaultTask.util.errorHandler(e, callback);
        });
        // TODO: return promise?
    };
}

fs.readFile('cpp.json', (err, data) => {
    if (err) return;
    const json = JSON.parse(data);
    if (!json.info.language) throw new Error('info.language is empty');
    if (!json.info.category) throw new Error('info.category is empty');
    exports.info = json.info;
    exports.options = json.options;
    exports.recipes = json.recipes;
    exports.command = {}; // TODO: rename command to commands

    for (let cmdname in json.commands) {
        const js = json.command[cmdname];
        if (js === 'default') {
            // TODO: 
            continue;
        }

    }
});