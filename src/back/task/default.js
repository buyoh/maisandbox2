const fs = require('fs');
const myexec = require('../exec');
const FileWrapper = require('./filewrapper');

/**
 * export default したい
 */
exports.generateDefaultTasks = function(codeExtension){
    return {
        /** */
        info: {
            /** visible task name */
            name: null,
            /** ace editor style */
            editor: null
        },
        options: {},
        recipes: {
            "compile > run":{
                tasks: ["setupAll", "compile", "run"]
            },
            "run(no update)":{
                tasks: ["setupIO", "run"]
            }
        },
        command:{
            setupAll: function(task, callback){
                const cwdir = FileWrapper.getTempDirName(task.uniqueName);
                FileWrapper.setupTemp(task.uniqueName, ()=>{
                    FileWrapper.writeFiles(cwdir+"/", [
                        {path:"code."+codeExtension, data:task.json.txt_code},
                        {path:"stdin.txt", data:task.json.txt_stdin}
                    ], (ok)=>{
                        if (ok == 2) callback.call(null, "continue", {});
                        else callback.call(null, "error", {});
                    });
                });
            },
            setupIO: function(task, callback){
                const cwdir = FileWrapper.getTempDirName(task.uniqueName);
                FileWrapper.setupTemp(task.uniqueName, ()=>{
                    FileWrapper.writeFiles(cwdir+"/", [
                        {path:"stdin.txt", data:task.json.txt_stdin}
                    ], (ok)=>{
                        if (ok == 1) callback.call(null, "continue", {});
                        else callback.call(null, "error", {});
                    });
                });
            }
        },
        util:{
            promiseResultResponser: promiseResultResponser,
            errorHandler: errorHandler
        }
    };
}

/**
 * 
 * @param {*} code 
 * @param {*} json 
 * @param {*} out 
 * @param {*} callback 
 * @param {*} pickupInformations 
 */
function promiseResultResponser(code, json, out, callback, pickupInformations = null, stdoutFilename = "stdout.txt", stderrFilename = "stderr.txt"){
    return new Promise((resolve, reject)=>{
        const stdout = out.find((v)=>(v.path == stdoutFilename)).data;
        const stderr = out.find((v)=>(v.path == stderrFilename)).data;
        const info = pickupInformations ? pickupInformations(stderr) : [];
        
        callback.call(null, code != 0 ? "failed" : "continue", {
            code: code, signal: json.signal,
            stdout: stdout, stderr: stderr,
            time: json.time, info: info, killer: null
        });
        if (code != 0) reject(); else resolve();
    });
}


function errorHandler(err, callback){
    if (err){
        console.error(err);
        callback.call(null, "error", {err:"internal error", killer: null});
    }
}