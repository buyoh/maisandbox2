const myexec = require('./util/exec');
const FileWrapper = require('./util/filewrapper');
const DefaultTask = require('./util/default').generateDefaultTasks('cpp');
const cpp = require('./cpp');

// -------------------------------------

// -------------------------------------

exports.info = {
    name: 'C++',
    editor: 'c_cpp',
    category: 'wsl',
    tabwidth: 4
};

const options = {
    optimization: ['default', '-O3'],
    std: ['-std=gnu++14', '-std=gnu++17', '-std=c++14', '-std=c++17']
};
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
    for (let line of msg.split('\n')) {
        const m = line.match(/^\.\/code\.cpp:(\d+):(\d+): (\w+):/);
        if (m) {
            infos.push({
                text: line,
                row: +m[1] - 1,
                column: +m[2] - 1,
                type: m[3]
            });
        }
    }
    return infos;
}
exports.pickupInformations = pickupInformations;

// -------------------------------------

exports.command = {
    /** setup files */
    setupAll: cpp.command.setupAll,
    setupIO: cpp.command.setupIO,

    /** compile codes */
    compile: function(task, callback) {
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(() => {
            return new Promise((resolve, reject) => {
                let param = 'g++ ./code.cpp';

                if (task.json.options.optimization === '-O3') param += ' -O3';
                if (options.std.includes(task.json.options.std)) param += ' ' + task.json.options.std;
                else param += ' -std=gnu++14';

                param += ' -o ./code.out 1> ./stdout.txt 2> ./stderr.txt';

                let killer = myexec.spawn_fileio(
                    'bash', ['-c', param],
                    null, null, null, {
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
    run: function(task, callback) {
        const suffixs = Object.keys(task.json.txt_stdins);
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(() => {
            return DefaultTask.util.promiseMultiSeries(suffixs.map((e) => [e]), (suffix) => {
                const nameStdin = 'stdin' + suffix + '.txt';
                const nameStdout = 'stdout' + suffix + '.txt';
                const nameStderr = 'stderr' + suffix + '.txt';
                return new Promise((resolve) => {
                    let killer = myexec.spawn_fileio(
                        'bash', ['-c', './code.out < ./' + nameStdin + ' 1> ./' + nameStdout + ' 2> ./' + nameStderr],
                        null, null, null, {
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