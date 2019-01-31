const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

// -------------------------------------

exports.info = {
    name: "Ruby Win",
    editor: "ruby",
};

exports.options = {}

// -------------------------------------

exports.recipes = {
    "check > run":{
        tasks: ["setupAll", "check", "run"]
    },
    "run(no update)":{
        tasks: ["setupIO","run"]
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
        const m = line.match(/^\.\/code\.rb\:(\d+)\:/);
        if (m) {
            infos.push({
                text: line,
                row: +m[1]-1,
                column: 0,
                type: "error"
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
                {path:"code.rb", data:task.json.txt_code},
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

    /** check syntax */
    check: function(task, callback){
        const cwdir = common.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "ruby", ["-c", "./code.rb"],
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt", {cwd: cwdir},
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
                    "ruby", ["./code.rb"], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {cwd: cwdir}, (code, json)=>{
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
                
                callback.call(null, code != 0 ? "failed" : "continue", {
                    code: code, signal: json.signal,
                    stdout: stdout, stderr: stderr,
                    time: json.time, info: info, killer: null
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
