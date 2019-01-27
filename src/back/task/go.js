const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

// -------------------------------------

exports.info = {
    name: "Go Win",
    editor: "golang",
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
    for (let line of msg.split("\n")){
        const m = line.match(/^\.\\code\.go\:(\d+)\:(\d+)\:/);
        if (m) {
            infos.push({
                text: line,
                row: +m[1]-1,
                column: +m[2]-1,
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

        common.setupTemp(task.uniqueName);
        const cwdir = common.tempDir(task.uniqueName);

        fs.writeFileSync(cwdir+"/code.go", task.json.txt_code);
        fs.writeFileSync(cwdir+"/stdin.txt", task.json.txt_stdin);

        callback.call(null, "continue", {});
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
                let param = ["build", "./code.go"];

                let killer = myexec.spawn_fileio(
                    "go",
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

