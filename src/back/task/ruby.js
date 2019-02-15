const myexec = require('../exec');
const FileWrapper = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('rb');

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
    setupAll: DefaultTask.command.setupAll,
    setupIO: DefaultTask.command.setupIO,

    /** check syntax */
    check: function(task, callback){
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                let killer = myexec.spawn_fileio(
                    "ruby", ["-c", "./code.rb"],
                    null, cwdir+"/stdout.txt", cwdir+"/stderr.txt", {cwd: cwdir},
                    (code, json)=>{
                        DefaultTask.util.promiseResultResponser(json, cwdir, callback, pickupInformations)
                        .then(()=>{
                            if (code === 0) resolve();
                            reject();
                        });
                    }
                );

                callback.call(null, "progress", {killer: killer});
            });

        }).catch((e)=>{
            DefaultTask.util.errorHandler(e, callback);
        });
    },

    /** run compiled file */
    run: function(task, callback){
        const suffixs = Object.keys(task.json.txt_stdins);
        const cwdir = FileWrapper.getTempDirName(task.uniqueName);

        Promise.resolve().then(()=>{
            return DefaultTask.util.promiseMultiSeries(suffixs.map((e)=>[e]), (suffix)=>{
                const nameStdin = "stdin"+suffix+".txt";
                const nameStdout = "stdout"+suffix+".txt";
                const nameStderr = "stderr"+suffix+".txt";
                return new Promise((resolve, reject)=>{
                    let killer = myexec.spawn_fileio(
                        "ruby", ["./code.rb"],
                        cwdir+"/"+nameStdin, cwdir+"/"+nameStdout, cwdir+"/"+nameStderr,
                        {cwd: cwdir},
                        (code, json)=>{ resolve(json); }
                    );
                    callback.call(null, "progress", {killer: killer});
                }).then((json)=>{
                    json.key = suffix;
                    return DefaultTask.util.promiseResultResponser(
                        json, cwdir, callback, pickupInformations,
                        nameStdout, nameStderr, "ac", "wa"
                    ).then(()=>Promise.resolve(json.code));
                });
            });
        }).then((args)=>{
            if (args.filter((e)=>(e != 0)).length === 0)
                callback.call(null, "continue");
            else
                callback.call(null, "failed");
            return Promise.resolve();
        }).catch((e)=>{
            DefaultTask.util.errorHandler(e, callback);
        });
    }
};
