const fs = require('fs');
const myexec = require('../exec');
const FileWrapper = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('cpp');

// -------------------------------------

exports.info = {
    name: "cLay",
    editor: "c_cpp",
};

const options = {
    optimization: ["default", "-O3"],
    std: ["-std=gnu++11", "-std=gnu++14", "-std=g++17"]
};
exports.options = options;

// -------------------------------------

exports.recipes = {
    "convert > compile > run":{
        tasks: ["setupAll", "convert", "compile", "run"]
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
    
    /** compile codes */
    convert: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{

                let killer = myexec.spawn_fileio(
                    "./tool/clay.exe",
                    [],
                    cwdir+"/code.cpp", cwdir+"/code_gen.cpp", cwdir+"/stderr.txt",
                    {},
                    (code, json)=>{
                        FileWrapper.readFiles(cwdir+"/", [{path:"code_gen.cpp"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        });
                    }
                );

                callback.call(null, "progress", {killer: killer});
            });

        }).then(([code, json, out])=>{
            return DefaultTask.util.promiseResultResponser(code, json, out, callback, null, "code_gen.cpp", "stderr.txt");
        }).catch((e)=>{
            DefaultTask.util.errorHandler(e, callback);
        });
    },

    /** compile codes */
    compile: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let param = ["./code_gen.cpp", "-o", "./code.out"];

                if (task.json.options.optimization === "-O3") param.push("-O3");
                if (options.std.includes(task.json.options.std)) param.push(task.json.options.std); else param.push("-std=gnu++14");

                let killer = myexec.spawn_fileio(
                    "g++",
                    param,
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {env:{PATH:FileWrapper.cygwinEnvPath}, cwd: cwdir},
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
    },

    /** run compiled file */
    run: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "./code.out",
                    [], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {env:{PATH:FileWrapper.cygwinEnvPath}, cwd: cwdir},
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

