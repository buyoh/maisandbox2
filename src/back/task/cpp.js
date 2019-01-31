const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

// -------------------------------------

exports.info = {
    name: "C++ Cyg",
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

/**
 * @param {string} msg 
 */
function pickupInformations(msg){
    if (!msg) return [];
    const infos = [];
    for (let line of msg.split("\n")){
        const m = line.match(/^\.\/code\.cpp\:(\d+)\:(\d+)\: (\w+)\:/);
        if (m) {
            infos.push({
                text: line,
                row: +m[1]-1,
                column: +m[2]-1,
                type: m[3]
            });
        }
    }
    return infos;
}

// -------------------------------------


exports.command = {
    /** setup files */
    setupAll: function(task, callback){
        const cwdir = common.getTempDirName(task.uniqueName);
        common.setupTemp(task.uniqueName, ()=>{
            common.writeFiles(cwdir+"/", [
                {path:"code.cpp", data:task.json.txt_code},
                {path:"stdin.txt", data:task.json.txt_stdin}
            ], (ok)=>{
                if (ok == 2) callback.call(null, "continue", {});
                else callback.call(null, "error", {});
            });
        });
    },
    
    setupIO: function(task, callback){
        const cwdir = common.getTempDirName(task.uniqueName);
        common.setupTemp(task.uniqueName, ()=>{
            common.writeFiles(cwdir+"/", [
                {path:"stdin.txt", data:task.json.txt_stdin}
            ], (ok)=>{
                if (ok == 1) callback.call(null, "continue", {});
                else callback.call(null, "error", {});
            });
        });
    },

    /** compile codes */
    compile: function(task, callback){
        const cwdir = common.getTempDirName(task.uniqueName);

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
                    (code, json)=>{
                        common.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        })
                    });

                callback.call(null, "progress", {killer: killer});
            });

        }).then(([code, json, out])=>{
            return new Promise((resolve, reject)=>{
                const stdout = out.find((v)=>(v.path == "stdout.txt")).data;
                const stderr = out.find((v)=>(v.path == "stderr.txt")).data;
                const info = pickupInformations(stderr);
                if (code != 0){
                    callback.call(null, "failed", {
                        code:   code,
                        signal: json.signal,
                        stdout: stdout,
                        stderr: stderr,
                        time:   json.time,
                        info:   info,
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
                        info:   info,
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
        const cwdir = common.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "./code.out",
                    [], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {env:{PATH:common.cygwinEnvPath}, cwd: cwdir},
                    (code, json)=>{
                        common.readFiles(cwdir+"/", [{path:"stdout.txt"},{path:"stderr.txt"}], (out)=>{
                            resolve([code, json, out]);
                        });
                    }
                );
                callback.call(null, "progress", {killer: killer});
            });
        }).then(([code, json, out])=>{
            return new Promise((resolve, reject)=>{
                
                const stdout = out.find((v)=>(v.path == "stdout.txt")).data;
                const stderr = out.find((v)=>(v.path == "stderr.txt")).data;
                
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
