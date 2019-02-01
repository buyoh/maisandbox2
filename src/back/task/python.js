const fs = require('fs');
const myexec = require('../exec');
const FileWrapper = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('py');

// -------------------------------------

exports.info = {
    name: "Python Win",
    editor: "python",
};

exports.options = {}

// -------------------------------------

exports.recipes = {
    "compile > run":{
        tasks: ["setupAll", "check", "run"]
    },
    "run(no update)":{
        tasks: ["setupIO", "run"]
    }
};

// -------------------------------------

exports.command = {
    /** setup files */
    setupAll: DefaultTask.command.setupAll,
    setupIO: DefaultTask.command.setupIO,

    /** check syntax */
    check: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "python", ["-m", "py_compile", "./code.py"],
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt", {cwd: cwdir},
                    (code, json)=>{
                        FileWrapper.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        })
                    });
                callback.call(null, "progress", {killer: killer});
            });

        }).then(([code, json, out])=>{
            return DefaultTask.util.promiseResultResponser(code, json, out, callback);
        }).catch((e)=>{
            DefaultTask.util.errorHandler(e, callback);
        });
    },

    /** run compiled file */
    run: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "python", ["./code.py"], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {cwd: cwdir}, (code, json)=>{
                        FileWrapper.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        })
                    }
                );

                callback.call(null, "progress", {killer: killer});
            });
        }).then(([code, json, out])=>{
            return DefaultTask.util.promiseResultResponser(code, json, out, callback);
        }).catch((e)=>{
            DefaultTask.util.errorHandler(e, callback);
        });
    }
};
