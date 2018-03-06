const fs = require('fs');
const myexec = require('../exec');
const common = require('./common');

exports.run = function(task){
    
    try{

        task.callback.call(null, "prepare", {killer: null});

        const lastCwd = process.cwd();
        common.setupTemp();
        process.chdir(common.tempDir);
    
        fs.writeFileSync("./code.cpp", task.json.txt_code);
        fs.writeFileSync("./stdin.txt", task.json.txt_stdin);

        
        let k1 = myexec.spawn_fileio("g++",["-std=gnu++14", "./code.cpp", "-o", "./code.out"], null, "./stdout.txt", "./stderr.txt", {env:{PATH:common.cygwinEnvPath}}, function(code, signal){
            if (code != 0){
                let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
                let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');

                task.callback.call(null, "failed", {code:code, signal:signal, stdout:stdout, stderr:stderr, killer: null});
    
                process.chdir(lastCwd);
                common.cleanTemp();
                return;
            }
    
            let k2 = myexec.spawn_fileio("./code.out",[], "./stdin.txt", "./stdout.txt", "./stderr.txt", {env:{PATH:common.cygwinEnvPath}}, function(code, signal){
                let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
                let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');
                
                task.callback.call(null, "success", {code:code, signal:signal, stdout:stdout, stderr:stderr, killer: null});
    
                process.chdir(lastCwd);
                common.cleanTemp();
            });
            task.callback.call(null, "execute", {killer: k2});
        });

        task.callback.call(null, "compile", {killer: k1});
        
    }catch(e){
        task.callback.call(null, "error", {err:e, killer: null});
    }
}