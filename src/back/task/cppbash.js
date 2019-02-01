const fs = require('fs');
const myexec = require('../exec');
const FileWrapper = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('cpp');
const cpp = require('./cpp');

// -------------------------------------

// -------------------------------------

exports.info = {
    name: "C++ Bash",
    editor: "c_cpp",
};

const options = {
    optimization: ["default", "-O3"],
    std: ["-std=gnu++14", "-std=gnu++17", "-std=c++14", "-std=c++17"]
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

exports.command = {
    /** setup files */
    setupAll: cpp.command.setupAll,
    setupIO: cpp.command.setupIO,

    /** compile codes */
    compile: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let param = "g++ ./code.cpp";

                if (task.json.options.optimization === "-O3") param += " -O3";
                if (options.std.includes(task.json.options.std)) param += " "+task.json.options.std; else param += " -std=gnu++14";

                param += " -o ./code.out 1> ./stdout.txt 2> ./stderr.txt";

                let killer = myexec.spawn_fileio(
                    "bash", ["-c", param],
                    null, null, null,
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
            return DefaultTask.util.promiseResultResponser(code, json, out, callback, cpp.pickupInformations);
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
                    "bash",
                    ["-c", "./code.out < ./stdin.txt 1> ./stdout.txt 2> ./stderr.txt"], null, null, null, 
                    {cwd: cwdir},
                    (code, json)=>{
                        FileWrapper.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        });
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
