const myexec = require('./util/exec');
const FileWrapper = require('./util/filewrapper');
const DefaultTask = require('./util/default').generateDefaultTasks('kt');

// -------------------------------------

exports.info = {
    language: 'Kotlin',
    category: 'windows',
};

const options = {};
exports.options = options;

// -------------------------------------

exports.recipes = {
    'compile > run': {
        script: ['setupAll', 'compile', 'run']
    },
    'run(no update)': {
        script: ['setupIO', 'run']
    }
};

// -------------------------------------

/**
 * @param {string} msg 
 */
function pickupInformations() {
    return [];
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
            return new Promise((resolve, reject) => {
                let param = ['code.kt', '-include-runtime', '-d'];

                let killer = myexec.spawn_fileio(
                    'kotlinc.bat', param, // windowsならkotlinc.bat
                    null, cwdir + '/stdout.txt', cwdir + '/stderr.txt', {
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
                        'java', ['CodeKt'],
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