const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

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
    setupAll: function(task, callback){
        const cwdir = common.getTempDirName(task.uniqueName);
        common.setupTemp(task.uniqueName, ()=>{
            common.writeFiles(cwdir+"/", [
                {path:"code.js", data:task.json.txt_code},
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

    /** run compiled file */
    run: function(task, callback){
        const cwdir = common.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "node", ["./code.js"], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
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
