const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

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
    setupAll: function(task, callback){
        
        const cwdir = common.tempDir(task.uniqueName);
        common.setupTemp(task.uniqueName, ()=>{
            fs.writeFileSync(cwdir+"/code.rs", task.json.txt_code);
            fs.writeFileSync(cwdir+"/stdin.txt", task.json.txt_stdin);

            callback.call(null, "continue", {});
        });
    },
    
    setupIO: function(task, callback){
        common.setupTemp(task.uniqueName);
        const cwdir = common.tempDir(task.uniqueName);

        fs.writeFileSync(cwdir+"/stdin.txt", task.json.txt_stdin);

        callback.call(null, "continue", {});
    },

    /** compile codes */
    compile: function(task, callback){
        const cwdir = common.tempDir(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let param = ["./code.rs", "-o", "./code.exe"];

                let killer = myexec.spawn_fileio(
                    "rustc",
                    param,
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt",
                    {cwd: cwdir},
                    function(code, json){ resolve([code, json]); });

                callback.call(null, "progress", {killer: killer});
            });

        }).then(([code, json])=>{
            return new Promise((resolve, reject)=>{
                let stdout = fs.readFileSync(cwdir+"/stdout.txt", 'UTF-8');
                let stderr = fs.readFileSync(cwdir+"/stderr.txt", 'UTF-8');
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
        const cwdir = common.tempDir(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "./code.exe",
                    [], cwdir+"/stdin.txt", cwdir+"/stdout.txt", cwdir+"/stderr.txt",
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

