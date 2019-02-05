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
                const files = [
                    {path:"code."+codeExtension, data:task.json.txt_code},
                    {path:"stdin.txt", data:task.json.txt_stdin}
                ];
                for (let key in task.json.txt_stdins){
                    files.push(
                        {path: "stdin"+(key)+".txt", data:task.json.txt_stdins[key]}
                    );
                }

                const cwdir = FileWrapper.getTempDirName(task.uniqueName);
                FileWrapper.setupTemp(task.uniqueName, ()=>{
                    FileWrapper.writeFiles(cwdir+"/", files, (ok)=>{
                        if (ok == files.length) callback.call(null, "continue", {});
                        else callback.call(null, "error", {});
                    });
                });
            },
            setupIO: function(task, callback){
                const files = [
                    {path:"stdin.txt", data:task.json.txt_stdin}
                ];
                for (let key in task.json.txt_stdins){
                    files.push(
                        {path: "stdin"+(key)+".txt", data:task.json.txt_stdins[key]}
                    );
                }

                const cwdir = FileWrapper.getTempDirName(task.uniqueName);
                FileWrapper.setupTemp(task.uniqueName, ()=>{
                    FileWrapper.writeFiles(cwdir+"/", files, (ok)=>{
                        if (ok == files.length) callback.call(null, "continue", {});
                        else callback.call(null, "error", {});
                    });
                });
            }
        },
        util:{
            promiseResultResponser: promiseResultResponser,
            promiseMultiExecutor: promiseMultiExecutor,
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
function promiseResultResponser(code, json, out, callbackTask, pickupInformations = null, stdoutFilename = "stdout.txt", stderrFilename = "stderr.txt"){
    return new Promise((resolve, reject)=>{
        const stdout = out.find((v)=>(v.path == stdoutFilename)).data;
        const stderr = out.find((v)=>(v.path == stderrFilename)).data;
        const note = pickupInformations ? pickupInformations(stderr) : [];
        
        callbackTask.call(null, code != 0 ? "failed" : "continue", {
            code: code, signal: json.signal,
            stdout: stdout, stderr: stderr,
            time: json.time, note: note, killer: null
        });
        if (code != 0) reject(); else resolve();
    });
}


function errorHandler(err, callbackTask){
    if (err){
        console.error(err);
        callbackTask.call(null, "error", {err:"internal error", killer: null});
    }
}


/**
 * @param {[any[],...]} iterationArgs
 * @param {(args?)=>Promise<any>} promiseSingleExecution 
 */
function promiseMultiExecutor(iterationArgs, promiseSingleExecution){
    return new Promise((resolve, reject)=>{
        let promise = Promise.resolve();
        const results = [];
        for (let args of iterationArgs){
            promise = promise.then(()=>{
                return promiseSingleExecution(...args);
            });
            promise.then((result)=>{
                results.push(result);
            });
        }
        promise.then(()=>{
            resolve(results);
        }).catch((...reason)=>{
            console.log("reject:", reason);
            reject(...reason);
        });
    });
}
