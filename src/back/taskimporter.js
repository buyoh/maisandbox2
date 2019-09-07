const task_ruby = require('./task/ruby');
const task_cpp = require('./task/cpp');
const task_cppraw = require('./task/cpp_raw');
const task_cppbash = require('./task/cppbash');
const task_py = require('./task/python');
const task_go = require('./task/go');
const task_rust = require('./task/rust');
const task_nodejs = require('./task/nodejs');
const task_sh = require('./task/shWsl');
const task_clay = require('./task/cLay');
const task_kotlin = require('./task/kotlin');

const tasks = {
    'Ruby': task_ruby,
    'C++Cyg': task_cpp,
    'C++': task_cppraw,
    'C++Bash': task_cppbash,
    'Python': task_py,
    'Go': task_go,
    'Rust': task_rust,
    'javascript(node)': task_nodejs,
    'sh': task_sh,
    'clay': task_clay,
    'kotlin': task_kotlin
};

exports.tasks = tasks;

exports.allLangInfo = (() => {
    const a = [];
    for (let cmd in tasks) {
        const task = tasks[cmd];
        const j = Object.assign({ cmd: cmd }, task.info);
        j.recipes = task.recipes;
        j.options = task.options;
        a.push(j);
    }
    return a;
})();
