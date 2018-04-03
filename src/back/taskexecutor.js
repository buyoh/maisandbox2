
const fs = require('fs');
const myexec = require('./exec');

const task_ruby = require('./task/ruby');
const task_cpp = require('./task/cpp');



exports.taskTypeList = [
    {name:'Ruby',   cmd:'Ruby', editor:'ruby'},
    {name:'C++',    cmd:'C++',  editor:'c_cpp'}
];


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

    // runとexecuteの用語が雑になっているので統一する
    
    if (task.json.query === 'run'){
        
        // TODO: クラス化
        if (task.json.cmd === 'Ruby')
            task_ruby.run(task);
        else if (task.json.cmd === 'C++')
            task_cpp.run(task);
        else{
            task.callback('error', 'unknown cmd');
        }
        
    }else if (task.json.query === 'build'){

        // TODO: クラス化
        if (task.json.cmd === 'Ruby')
            task_ruby.build(task);
        else if (task.json.cmd === 'C++')
            task_cpp.build(task);
        else{
            task.callback('error', 'unknown cmd');
        }

    }else if (task.json.query === 'execute'){
        
        // TODO: クラス化
        if (task.json.cmd === 'Ruby')
            task_ruby.execute(task);
        else if (task.json.cmd === 'C++')
            task_cpp.execute(task);
        else{
            task.callback('error', 'unknown cmd');
        }

    }else{
        task.callback('error', 'unknown query');

    }
}



function setupTemp(){
    fs.mkdir(tempDir, function(err){});
}
function cleanTemp(){
    // nop
}