const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

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
    setupAll: function(task, callback){
        const cwdir = common.tempDir(task.uniqueName);
        common.setupTemp(task.uniqueName, ()=>{
            fs.writeFileSync(cwdir+"/code.clay.cpp", task.json.txt_code);
            fs.writeFileSync(cwdir+"/stdin.txt", task.json.txt_stdin);

            callback.call(null, "continue", {});
        });
    },
    
    setupIO: function(task, callback){
        const cwdir = common.tempDir(task.uniqueName);
        common.setupTemp(task.uniqueName, ()=>{
            fs.writeFileSync(cwdir+"/stdin.txt", task.json.txt_stdin);

            callback.call(null, "continue", {});
        });
    },

    /** compile codes */
    convert: function(task, callback){
        const cwdir = common.tempDir(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{

                let killer = myexec.spawn_fileio(
                    "./tool/clay.exe",
                    [],
                    cwdir+"/code.clay.cpp", cwdir+"/code.cpp", cwdir+"/stderr.txt",
                    {},
                    function(code, json){ resolve([code, json]); });

                callback.call(null, "progress", {killer: killer});
            });

        }).then(([code, json])=>{
            return new Promise((resolve, reject)=>{
                let stdout = fs.readFileSync(cwdir+"/code.cpp", 'UTF-8');
                let stderr = fs.readFileSync(cwdir+"/stderr.txt", 'UTF-8');
                if (code != 0){
                    callback.call(null, "failed", {
                        code:   code,
                        signal: json.signal,
                        stdout: stdout,
                        stderr: stderr,
                        time:   json.time,
                        killer: null
                    });
                    reject();
                }
                else{
                    callback.call(null, "continue", {
                        code:   code,
                        signal: json.signal,
                        stdout: stdout,
                        stderr: stderr,
                        time:   json.time,
                        killer: null
                    });
                    resolve();
                }
            });
        }).catch((e)=>{
            if (e){
                console.error(e);
                callback.call(null, "error", {err:e, killer: null});
            }
            
        });
    },

    /** compile codes */
    compile: function(task, callback){
        const cwdir = common.tempDir(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let param = ["./code.cpp", "-o", "./code.out"];

                if (task.json.options.optimization === "-O3") param.push("-O3");
                if (options.std.includes(task.json.options.std)) param.push(task.json.options.std); else param.push("-std=gnu++14");

                let killer = myexec.spawn_fileio(
                    "g++",
                    param,
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {env:{PATH:common.cygwinEnvPath}, cwd: cwdir},
                    function(code, json){ resolve([code, json]); });

                callback.call(null, "progress", {killer: killer});
            });

        }).then(([code, json])=>{
            return new Promise((resolve, reject)=>{
                let stdout = fs.readFileSync(cwdir+"/stdout.txt", 'UTF-8');
                let stderr = fs.readFileSync(cwdir+"/stderr.txt", 'UTF-8');
                if (code != 0){
                    callback.call(null, "failed", {
                        code:   code,
                        signal: json.signal,
                        stdout: stdout,
                        stderr: stderr,
                        time:   json.time,
                        killer: null
                    });
                    reject();
                }
                else{
                    callback.call(null, "continue", {
                        code:   code,
                        signal: json.signal,
                        stdout: stdout,
                        stderr: stderr,
                        time:   json.time,
                        killer: null
                    });
                    resolve();
                }
            });
        }).catch((e)=>{
            if (e){
                console.error(e);
                callback.call(null, "error", {err:e, killer: null});
            }
            
        });
    },

    /** run compiled file */
    run: function(task, callback){
        const cwdir = common.tempDir(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "./code.out",
                    [], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {env:{PATH:common.cygwinEnvPath}, cwd: cwdir}, function(code, json){ resolve([code, json]); }
                );
                callback.call(null, "progress", {killer: killer});
            });
        }).then(([code, json])=>{
            return new Promise((resolve, reject)=>{
                
                let stdout = fs.readFileSync(cwdir+"/stdout.txt", 'UTF-8');
                let stderr = fs.readFileSync(cwdir+"/stderr.txt", 'UTF-8');
                
                callback.call(null, code != 0 ? "failed" : "continue", {
                    code: code, signal: json.signal,
                    stdout: stdout, stderr: stderr,
                    time: json.time, killer: null
                });
    
                if (code != 0) reject(); else resolve();
            });
        }).catch((e)=>{
            if (e){
                console.error(e);
                callback.call(null, "error", {err:e, killer: null});
            }
        });
    }
};

