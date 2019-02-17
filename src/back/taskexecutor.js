const fs = require('fs');
const myexec = require('./exec');

const task_ruby = require('./task/ruby');
const task_cpp = require('./task/cpp');
const task_cppbash = require('./task/cppbash');
const task_py = require('./task/python');
const task_go = require('./task/go');
const task_rust = require('./task/rust');
const task_nodejs = require('./task/nodejs');
const task_sh = require('./task/shWsl');
const task_clay = require('./task/clay');

const langTasks = {
    "Ruby": task_ruby,
    "C++": task_cpp,
    "C++Bash": task_cppbash,
    "Python": task_py,
    "Go": task_go,
    "Rust": task_rust,
    "javascript(node)": task_nodejs,
    "sh": task_sh,
    "clay": task_clay
};

exports.allLangInfo = (() => {
    const a = [];
    for (let cmd in langTasks) {
        const j = {
            cmd: cmd
        };
        const task = langTasks[cmd];
        j.name = task.info.name;
        j.editor = task.info.editor;
        j.recipes = task.recipes;
        j.options = task.options;
        a.push(j);
    }
    return a;
})();


/**
 * タスクを追加，実行する
 * @param {JSON} json 
 * @param {(type:String, json:JSON) => boolean} callback 何か成功する度に呼び出す
 */
exports.pushTask = function(json, callback) {
    const task = {
        json: json,
        callback: callback
    };
    if (json.recipe === undefined) {
        task.callback.call(null, 'error', {
            reason: 'unknown recipe'
        }, true);
        return;
    }
    setTimeout((t) => {
        runTaskRecipe(t);
    }, 0, task);
}


function runTaskRecipe(task) {
    const langTask = langTasks[task.json.cmd];
    if (langTask === undefined) {
        task.callback.call(null, 'error', {
            reason: 'unknown cmd'
        }, true);
        return;
    }
    const recipe = langTask.recipes[task.json.recipe];
    if (recipe === undefined) {
        task.callback.call(null, 'error', {
            reason: 'unknown recipe'
        }, true);
        return;
    }

    task.uniqueName = task.json.socketid + "/" + task.json.cmd;

    const accepted = [];

    const process = function(taskIndex) {
        if (taskIndex >= recipe.tasks.length) {
            task.callback.call(null, 'success', {}, true);
            return;
        }
        if (!langTask.command[recipe.tasks[taskIndex]]) {
            task.callback.call(null, 'error', {
                reason: 'not found the task[' + recipe.tasks[taskIndex] + ']'
            }, true);
            return;
        }
        langTask.command[recipe.tasks[taskIndex]](task, (msg, json = {}) => {
            json.taskName = recipe.tasks[taskIndex];
            task.callback.call(null, msg, json);
            if (msg == 'continue' && !accepted[taskIndex]) {
                accepted[taskIndex] = true;
                process(taskIndex + 1);
            }
        })
    };
    process(0);
}