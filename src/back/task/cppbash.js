const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

// -------------------------------------

const uniqueName = "cppBash";

// -------------------------------------


exports.build = function(task){

    try{

        task.callback.call(null, "prepare", {killer: null});

        // step1
        const lastCwd = process.cwd();
        common.setupTemp(uniqueName);
        process.chdir(common.tempDir(uniqueName));
    
        // step2
        fs.writeFileSync("./code.cpp", task.json.txt_code);
        fs.writeFileSync("./stdin.txt", task.json.txt_stdin);
        
        // step3
        let k1 = myexec.spawn_fileio("bash", ["-c", "g++ -std=gnu++14 -O3 ./code.cpp -o ./code.out 1> ./stdout.txt 2> ./stderr.txt"], null, null, null, {}, function(code, json){

            // step4
            let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
            let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');
            if (code != 0){
                task.callback.call(null, "failed", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, time:{compile: json.time}, killer: null});
            }
            else{
                task.callback.call(null, "success", {code:0, stdout:stdout, stderr:stderr, killer: null, time: {compile: json.time}});
            }
            process.chdir(lastCwd);
        });

        task.callback.call(null, "compile", {killer: k1});
        
    }catch(e){
        task.callback.call(null, "error", {err:e, killer: null});
    }
};


exports.execute = function(task){

    try{

        task.callback.call(null, "prepare", {killer: null});

        // step1
        if (!common.isExistFile(common.tempDir(uniqueName)) || 
            !common.isExistFile(common.tempDir(uniqueName)+"/code.out")){
            task.callback.call(null, "failed", {code:-1, signal:null, stdout:"", stderr:"you need to build", killer: null, time: {compile: -1}});
        }

        const lastCwd = process.cwd();
        process.chdir(common.tempDir(uniqueName));
    
        // step2
        fs.writeFileSync("./stdin.txt", task.json.txt_stdin);
        
        // step3
        let k1 = myexec.spawn_fileio("bash",["-c", "./code.out < ./stdin.txt 1> ./stdout.txt 2> ./stderr.txt"], null, null, null, {}, function(code, json){

            // step4
            let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
            let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');
            
            // step5
            task.callback.call(null, "success", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, time:{compile:-1, execute: json.time}, killer: null});

            process.chdir(lastCwd);
            common.cleanTemp(uniqueName);
        });

        task.callback.call(null, "execute", {killer: k1});
        
    }catch(e){
        task.callback.call(null, "error", {err:e, killer: null});
    }
};



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
                fs.writeFileSync("./code.cpp", task.json.txt_code);
                fs.writeFileSync("./stdin.txt", task.json.txt_stdin);
                resolve();
            });

        }).then(()=>{
            return new Promise((resolve, reject)=>{
                // step 3
                let killer = myexec.spawn_fileio("bash", ["-c", "g++ -std=gnu++14 -O3 ./code.cpp -o ./code.out 1> ./stdout.txt 2> ./stderr.txt"], null, null, null, {}, function(code, json){
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

                    task.callback.call(null, "failed", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, time:{compile:json.time}, killer: null});
        
                    finalize();
                    reject();
                    return;
                }
                
                // step5
                let killer = myexec.spawn_fileio("bash",["-c", "./code.out < ./stdin.txt 1> ./stdout.txt 2> ./stderr.txt"], null, null, null, {}, function(new_code, new_json){
                    new_json.compileTime = json.time;
                    resolve([new_code, new_json]);
                });
                task.callback.call(null, "execute", {time:{compile:json.time}, killer: killer});
            });

        }).then(([code, json])=>{
            return new Promise((resolve, reject)=>{
                // ste6
                let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
                let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');
                
                // step7
                task.callback.call(null, "success", {code:code, signal:json.signal, stdout:stdout, stderr:stderr, time:{compile:json.compileTime, execute: json.time}, killer: null});
    
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
};

exports.compile = function(task){

};