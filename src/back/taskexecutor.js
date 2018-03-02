
const fs = require('fs');
//const child_process = require('child_process');
const myexec = require('./exec');

/** tempDir */
const tempDir = "./temp";



/**
 * タスクを追加，実行する
 * @param {JSON} json 
 * @param {(type:String, json:JSON) => boolean} callback 何か成功する度に呼び出す
 */
exports.pushTask = function(json, callback){
    const task = {
        json:json,
        callback:callback
    };
    setTimeout(function(t){runTask(t);}, 0, task);
}



function runTask(task){

    try{

        task.callback.call(null, "prepare", {});

        setupTemp();
        process.chdir(tempDir);
    
        fs.writeFileSync("./code.rb", task.json.txt_code);
        fs.writeFileSync("./stdin.txt", task.json.txt_stdin);
    
        myexec.spawn_fileio("ruby",["./code.rb"], "./stdin.txt", "./stdout.txt", "./stderr.txt", function(code, signal){
            let stdout = fs.readFileSync("./stdout.txt", 'UTF-8');
            let stderr = fs.readFileSync("./stderr.txt", 'UTF-8');
            
            task.callback.call(null, "success", {code:code, signal:signal, stdout:stdout, stderr:stderr});

            process.chdir("../");
        });
        
        task.callback.call(null, "execute", {});
    }catch(e){
        task.callback.call(null, "error", {err:e});
    }
}


function setupTemp(){
    fs.mkdir(tempDir, function(err){});
}
function cleanTemp(){
    // nop
}