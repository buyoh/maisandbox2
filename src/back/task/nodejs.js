const fs = require('fs');
const myexec = require('../exec');
const FileWrapper = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('js');

// -------------------------------------

exports.info = {
    name: "nodejs Win",
    editor: "javascript",
};

exports.options = {}

// -------------------------------------

exports.recipes = {
    "run":{
        tasks: ["setupAll", "run"]
    },
    "run(no update)":{
        tasks: ["setupIO","run"]
    }
};

// -------------------------------------

exports.command = {
    /** setup files */
    setupAll: DefaultTask.command.setupAll,
    setupIO: DefaultTask.command.setupIO,

    /** run compiled file */
    run: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "node", ["./code.js"], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
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
