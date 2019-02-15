const myexec = require('../exec');
const FileWrapper = require('./filewrapper');
const DefaultTask = require('./default').generateDefaultTasks('sh');

// -------------------------------------

exports.info = {
    name: "sh WSL",
    editor: "sh",
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
    setupAll: DefaultTask.command.setupAll,
    setupIO: DefaultTask.command.setupIO,

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
                        "bash", ["-c", "sh ./code.sh < ./"+nameStdin+" 1> ./"+nameStdout+" 2> ./"+nameStderr],
                        null, null, null, 
                        {cwd: cwdir},
                        (code, json)=>{ resolve(json); }
                    );
                    callback.call(null, "progress", {killer: killer});
                }).then((json)=>{
                    json.key = suffix;
                    return DefaultTask.util.promiseResultResponser(
                        json, cwdir, callback, null,
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
