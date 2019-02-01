const fs = require('fs');
const myexec = require('../exec');
const common = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('sh');

// -------------------------------------

exports.info = {
    name: "sh WSL",
    editor: "sh",
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
        const cwdir = common.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "bash",
                    ["-c", "sh ./code.sh < ./stdin.txt 1> ./stdout.txt 2> ./stderr.txt"], null, null, null, 
                    {cwd: cwdir}, (code, json)=>{
                        common.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
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
    }
};
