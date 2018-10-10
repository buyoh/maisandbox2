const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

// -------------------------------------

const uniqueName = "python3";

// -------------------------------------

exports.build = function(task){

    const lastCwd = process.cwd();
    try{

        task.callback.call(null, "prepare", {killer: null});

        // step1
        common.setupTemp(uniqueName);
        process.chdir(common.tempDir(uniqueName));
    
        // step2
        fs.writeFileSync("./code.py", task.json.txt_code);

        // step3
        let k1 = myexec.spawn_fileio("python",["-m", "py_compile", "./code.py"], null, "./stdout.txt", "./stderr.txt", {}, function(code, json){

            // step4
            let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
            let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');

            // step5
            if (code != 0){
                task.callback.call(null, "failed", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, killer: null, time: {compile: json.time}});
            }
            else{
                task.callback.call(null, "success", {stdout:stdout, stderr:stderr, killer: null, time: {compile: json.time}});
            }

            process.chdir(lastCwd);
        });
        
        task.callback.call(null, "compile", {killer: k1});
        
    }catch(e){
        task.callback.call(null, "error", {err:e, killer: null});
        process.chdir(lastCwd);
    }
}


exports.execute = function(task){

    try{

        task.callback.call(null, "prepare", {killer: null});

        // step1
        if (!common.isExistFile(common.tempDir(uniqueName)) || 
            !common.isExistFile(common.tempDir(uniqueName)+"/code.py")){
            task.callback.call(null, "failed", {code:-1, signal:null, stdout:"", stderr:"you need to build", killer: null, time: {compile: -1}});
        }

        const lastCwd = process.cwd();
        process.chdir(common.tempDir(uniqueName));
        
        // step2
        fs.writeFileSync("./stdin.txt", task.json.txt_stdin);

        // step3
        let k1 = myexec.spawn_fileio("python",["./code.py"], "./stdin.txt", "./stdout.txt", "./stderr.txt", {}, function(code, json){

            // step4
            let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
            let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');
            
            // step5
            task.callback.call(null, "success", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, killer: null, time: {compile: -1, execute: json.time}});

            process.chdir(lastCwd);
            common.cleanTemp();
        });
        
        task.callback.call(null, "execute", {killer: k1});
        
    }catch(e){
        task.callback.call(null, "error", {err:e, killer: null});
    }
}


exports.run = function(task){
    
    try{

        task.callback.call(null, "prepare", {killer: null});

        // step1
        const lastCwd = process.cwd();
        common.setupTemp(uniqueName);
        process.chdir(common.tempDir(uniqueName));
    
        const finalize = ()=>{
            process.chdir(lastCwd);
            common.cleanTemp(uniqueName);
        };
        

        Promise.resolve().then(()=>{
            return new Promise((resolve, reject)=>{
                // step2
                fs.writeFileSync("./code.py", task.json.txt_code);
                fs.writeFileSync("./stdin.txt", task.json.txt_stdin);
                resolve();
            });

        }).then(()=>{
            return new Promise((resolve, reject)=>{
                // step3
                let killer = myexec.spawn_fileio("python",["-m", "py_compile", "./code.py"], null, "./stdout.txt", "./stderr.txt", {}, function(code, json){
                    resolve([code, json]);
                });
                task.callback.call(null, "compile", {killer: killer});
            });

        }).then(([code, json])=>{
            return new Promise((resolve, reject)=>{
                // step4
                if (code != 0){
                    let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
                    let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');

                    task.callback.call(null, "failed", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, killer: null, time: {compile: json.time}});
        
                    finalize();
                    reject(); return;
                }
                // step5
                let killer = myexec.spawn_fileio("python",["./code.py"], "./stdin.txt", "./stdout.txt", "./stderr.txt", {}, function(new_code, new_json){
                    new_json.compileTime = json.time;
                    resolve([new_code, new_json]);
                });
                task.callback.call(null, "execute", {killer: killer, time: {compile: json.time}});
            });

        }).then(([code, json])=>{
            return new Promise((resolve, reject)=>{
                // step6
                let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
                let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');
                
                // step7
                task.callback.call(null, "success", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, killer: null, time: {compile: json.compileTime, execute: json.time}});

                finalize();
                resolve();
            });

        }).catch((e)=>{
            if (e !== false){
                task.callback.call(null, "error", {err:e, killer: null});
            }
            finalize();
        });
        
    }catch(e){
        task.callback.call(null, "error", {err:e, killer: null});
        finalize();
    }
}