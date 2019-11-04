// かり

const fs = require('fs');

const Exec = require('./util/exec');
const FileWrapper = require('./util/filewrapper');
const DefaultTask = require('./util/default').generateDefaultTasks('cpp');


function replaceArgument(elem, task) {
    if (!elem) return elem;
    if (elem[0] === '$') {
        return task.json.options[elem.substr(1, -1)];
    }
    else if (elem[0] === '#') {
        return '';
    }
    else return elem;
}

function parseAction(action) {
    if (action.cmd === 'exec') {
        return (task, cwdir, callback) => {
            return new Promise((resolve, reject) => {
                const param = action.args.map(e => replaceArgument(e, task));

                let killer = Exec.spawn_fileio(
                    action.cmd, param,
                    null, cwdir + '/stdout.txt', cwdir + '/stderr.txt', {
                    // env: {
                    //     PATH: FileWrapper.cygwinEnvPath
                    // },
                        cwd: cwdir
                    },
                    (code, json) => {
                        DefaultTask.util.promiseResultResponser(json, cwdir, callback, pickupInformations)
                            .then(() => {
                                if (code === 0) resolve();
                                reject();
                            });
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

fs.readFile('cpp.json', (err, data) => {
    if (err) return;
    const json = JSON.parse(data);
    if (!json.info.language) throw new Error('info.language is empty');
    if (!json.info.category) throw new Error('info.category is empty');
    exports.info = json.info;
    exports.options = json.options;
    exports.recipes = json.recipes;
    exports.command = {}; // TODO: rename command to commands

    for (let cmdname in json.command) {
        const js = json.command[cmdname];
        if (js === 'default') {
            // TODO: 
            continue;
        }

    }
});