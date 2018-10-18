
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

exports.langList = (()=>{
    const a = [];
    for (let key in langTask){
        a.push(Object.assign(langTask[key].info, {cmd: key}));
    }
    return a;
})();

exports.allRecipes = (()=>{
    const recipes = {};
    for(let lang in langTask) {
        const task = langTask[lang];
        recipes[lang] = task.recipes;
    }
    return recipes;
})();

exports.allOptions = (()=>{
    const options = {};
    for(let lang in langTask) {
        const task = langTask[lang];
        options[lang] = task.options;
    }
    return options;
})();


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
    if (json.recipe !== undefined)
        setTimeout(function(t){runTaskRecipe(t);}, 0, task);
    else
        setTimeout(function(t){runTaskLegacy(t);}, 0, task);
}


function runTaskRecipe(task){
    const lt = langTask[task.json.cmd];
    if (lt === undefined){
        task.callback.call(null, 'error', 'unknown cmd'); return;
    }
    const recipe = lt.recipes[task.json.recipe];
    if (recipe === undefined){
        task.callback.call(null, 'error', 'unknown recipe'); return;
    }
    
    const process = function(taskIndex){
        if (taskIndex >= recipe.tasks.length){
            task.callback.call(null, 'success', {});
            return;
        }
        if (!lt.command[recipe.tasks[taskIndex]]){
            task.callback.call(null, 'error', {reason: 'not found the task['+recipe.tasks[taskIndex]+']'});
            return;
        }
        lt.command[recipe.tasks[taskIndex]](task, (msg, json)=>{
            json.taskName = recipe.tasks[taskIndex];
            task.callback.call(null, msg, json);
            if (msg == 'continue')
                process(taskIndex + 1);
        })
    };
    process(0);
}



function runTaskLegacy(task){

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