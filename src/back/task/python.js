const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

// -------------------------------------

const uniqueName = "python3";

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
    setupAll: function(task, callback){
        common.setupTemp(uniqueName);
        const cwdir = common.tempDir(uniqueName);

        fs.writeFileSync(cwdir+"/code.py", task.json.txt_code);
        fs.writeFileSync(cwdir+"/stdin.txt", task.json.txt_stdin);

        callback.call(null, "continue", {});
    },
    
    setupIO: function(task, callback){
        common.setupTemp(uniqueName);
        const cwdir = common.tempDir(uniqueName);

        fs.writeFileSync(cwdir+"/stdin.txt", task.json.txt_stdin);

        callback.call(null, "continue", {});
    },

    /** check syntax */
    check: function(task, callback){
        const cwdir = common.tempDir(uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "python", ["-m", "py_compile", "./code.py"],
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt", {cwd: cwdir},
                    function(code, json){ resolve([code, json]); }
                );
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
        const cwdir = common.tempDir(uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "python", ["./code.py"], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {cwd: cwdir}, function(code, json){ resolve([code, json]); }
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
