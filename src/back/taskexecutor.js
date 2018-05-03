
const fs = require('fs');
const myexec = require('./exec');

const task_ruby = require('./task/ruby');
const task_cpp = require('./task/cpp');
const task_cppbash = require('./task/cppbash');
const task_py = require('./task/python');

const langTask = {
    "Ruby": task_ruby,
    "C++" : task_cpp,
    "C++Bash" : task_cppbash,
    "Python": task_py
};

exports.langList = [
    {name:'Ruby',   cmd:'Ruby', editor:'ruby'},
    {name:'C++',    cmd:'C++',  editor:'c_cpp'},
    {name:'C++Bash',    cmd:'C++Bash',  editor:'c_cpp'},
    {name:'Python',    cmd:'Python',  editor:'python'}
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

    // 
    if (langTask[task.json.cmd] === undefined){
        task.callback('error', 'unknown cmd');
        return;
    }
    
    if (task.json.query === 'run'){
        
        langTask[task.json.cmd].run(task);
    }
    else if (task.json.query === 'build'){

        langTask[task.json.cmd].build(task);
    }
    else if (task.json.query === 'execute'){
        
        langTask[task.json.cmd].execute(task);
    }
    else{
        task.callback('error', 'unknown query');

    }
}



function setupTemp(){
    fs.mkdir(tempDir, function(err){});
}
function cleanTemp(){
    // nop
}