const myexec = require('./util/exec');
const FileWrapper = require('./util/filewrapper');
const DefaultTask = require('./util/default').generateDefaultTasks('rs');

// -------------------------------------

exports.info = {
    language: 'Rust',
    category: 'default',
};

const options = {};
exports.options = options;

// -------------------------------------

exports.recipes = {
    'compile > run': {
        tasks: ['setupAll', 'compile', 'run']
    },
    'run(no update)': {
        tasks: ['setupIO', 'run']
    }
};

// -------------------------------------

/**
 * @param {string} msg 
 */
function pickupInformations(msg) {
    if (!msg) return [];
    const infos = [];
    let lastline = null;
    for (let line of msg.split('\n')) {
        const m = line.match(/^ --> \.\/code\.rs:(\d+):(\d+)/);
        if (m) {
            const m2 = lastline.match(/^(\w+)\W/);
            infos.push({
                text: lastline,
                row: +m[1] - 1,
                column: +m[2] - 1,
                type: m2 ? m2[1] : 'information'
            });
        }
        lastline = line;
    }
    return infos;
}

// -------------------------------------


exports.command = {
    /** setup files */
    setupAll: DefaultTask.command.setupAll,
    setupIO: DefaultTask.command.setupIO,

    /** compile codes */
    compile: function (task, callback) {
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(() => {
            return new Promise((resolve) => {
                let param = ['./code.rs', '-o', './code.exe'];

                let killer = myexec.spawn_fileio(
                    'rustc', param,
                    null, cwdir + '/stdout.txt', cwdir + '/stderr.txt', {
                        cwd: cwdir
                    },
                    (code, json) => {
                        DefaultTask.util.promiseResultResponser(json, cwdir, callback, pickupInformations)
                            .then(() => {
                                resolve();
                            });
                    }
                );

                callback.call(null, 'progress', {
                    killer: killer
                });
            });

        }).catch((e) => {
            DefaultTask.util.errorHandler(e, callback);
        });
    },

    /** run compiled file */
    run: function (task, callback) {
        const suffixs = Object.keys(task.json.txt_stdins);
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(() => {
            return DefaultTask.util.promiseMultiSeries(suffixs.map((e) => [e]), (suffix) => {
                const nameStdin = 'stdin' + suffix + '.txt';
                const nameStdout = 'stdout' + suffix + '.txt';
                const nameStderr = 'stderr' + suffix + '.txt';
                return new Promise((resolve) => {
                    let killer = myexec.spawn_fileio(
                        './code.exe', [],
                        cwdir + '/' + nameStdin, cwdir + '/' + nameStdout, cwdir + '/' + nameStderr, {
                            cwd: cwdir
                        },
                        (code, json) => {
                            resolve(json);
                        }
                    );
                    callback.call(null, 'progress', {
                        killer: killer
                    });
                }).then((json) => {
                    json.key = suffix;
                    return DefaultTask.util.promiseResultResponser(
                        json, cwdir, callback, pickupInformations,
                        nameStdout, nameStderr, 'ac', 'wa'
                    ).then(() => Promise.resolve(json.code));
                });
            });
        }).then((args) => {
            if (args.filter((e) => (e != 0)).length === 0)
                callback.call(null, 'continue');
            else
                callback.call(null, 'failed');
            return Promise.resolve();
        }).catch((e) => {
            DefaultTask.util.errorHandler(e, callback);
        });
    }
};