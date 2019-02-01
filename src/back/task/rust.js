const fs = require('fs');
const myexec = require('../exec');
const FileWrapper = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('rs');

// -------------------------------------

exports.info = {
    name: "Rust Win",
    editor: "rust",
};

const options = {
};
exports.options = options;

// -------------------------------------

exports.recipes = {
    "compile > run":{
        tasks: ["setupAll", "compile", "run"]
    },
    "run(no update)":{
        tasks: ["setupIO", "run"]
    }
};

// -------------------------------------

/**
 * @param {string} msg 
 */
function pickupInformations(msg){
    if (!msg) return [];
    const infos = [];
    let lastline = null;
    for (let line of msg.split("\n")){
        const m = line.match(/^ --> \.\/code\.rs\:(\d+)\:(\d+)/);
        if (m) {
            const m2 = lastline.match(/^(\w+)\W/);
            infos.push({
                text: lastline,
                row: +m[1]-1,
                column: +m[2]-1,
                type: m2 ? m2[1] : "information"
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
    compile: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let param = ["./code.rs", "-o", "./code.exe"];

                let killer = myexec.spawn_fileio(
                    "rustc",
                    param,
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {cwd: cwdir},
                    (code, json)=>{
                        FileWrapper.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        })
                    }
                );

                callback.call(null, "progress", {killer: killer});
            });
        }).then(([code, json, out])=>{
            return DefaultTask.util.promiseResultResponser(code, json, out, callback, pickupInformations);
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
                    "./code.exe",
                    [], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {cwd: cwdir}, (code, json)=>{
                        FileWrapper.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        })
                    });

                callback.call(null, "progress", {killer: killer});
            });

        }).then(([code, json, out])=>{
            return DefaultTask.util.promiseResultResponser(code, json, out, callback, pickupInformations);
        }).catch((e)=>{
            DefaultTask.util.errorHandler(e, callback);
        });
    }
};

