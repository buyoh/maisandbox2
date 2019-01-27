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
        
        const cwdir = common.tempDir(task.uniqueName);
        common.setupTemp(task.uniqueName, ()=>{
            fs.writeFileSync(cwdir+"/code.js", task.json.txt_code);
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

    /** run compiled file */
    run: function(task, callback){
        const cwdir = common.tempDir(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "node", ["./code.js"], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
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
