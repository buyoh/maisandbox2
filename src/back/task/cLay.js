const myexec = require('./util/exec');
const FileWrapper = require('./util/filewrapper');
const DefaultTask = require('./util/default').generateDefaultTasks('cpp');

// -------------------------------------

exports.info = {
    language: 'cLay',
    category: 'default',
};

const options = {
    optimization: ['default', '-O3'],
    std: ['-std=gnu++11', '-std=gnu++14', '-std=g++17']
};
exports.options = options;

// -------------------------------------

exports.recipes = {
    'convert > compile > run': {
        script: ['setupAll', 'convert', 'compile', 'run']
    },
    'run(no update)': {
        script: ['setupIO', 'run']
    }
};

// -------------------------------------


exports.command = {
    /** setup files */
    setupAll: DefaultTask.command.setupAll,
    setupIO: DefaultTask.command.setupIO,

    /** compile codes */
    convert: function (task, callback) {
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(() => {
            return new Promise((resolve, reject) => {

                let killer = myexec.spawn_fileio(
                    './tool/clay.exe', [],
                    cwdir + '/code.cpp', cwdir + '/code_gen.cpp', cwdir + '/stderr.txt', {},
                    (code, json) => {
                        DefaultTask.util.promiseResultResponser(json, cwdir, callback, null, 'code_gen.cpp')
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

    /** compile codes */
    compile: function (task, callback) {
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(() => {
            return new Promise((resolve, reject) => {
                let param = ['./code_gen.cpp', '-o', './code.out'];

                if (task.json.options.optimization === '-O3') param.push('-O3');
                if (options.std.includes(task.json.options.std)) param.push(task.json.options.std);
                else param.push('-std=gnu++14');

                let killer = myexec.spawn_fileio(
                    'g++', param,
                    null, cwdir + '/stdout.txt', cwdir + '/stderr.txt', {
                    env: {
                        PATH: FileWrapper.cygwinEnvPath
                    },
                    cwd: cwdir
                },
                    (code, json) => {
                        DefaultTask.util.promiseResultResponser(json, cwdir, callback)
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
                        './code.out', [],
                        cwdir + '/' + nameStdin, cwdir + '/' + nameStdout, cwdir + '/' + nameStderr, {
                        env: {
                            PATH: FileWrapper.cygwinEnvPath
                        },
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
                        json, cwdir, callback, null,
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