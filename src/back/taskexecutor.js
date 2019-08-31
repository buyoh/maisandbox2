
const Importer = require('./taskimporter');


/**
 * タスクを追加，実行する
 * @param {JSON} json 
 * @param {(type:String, json:JSON) => boolean} callback 何か成功する度に呼び出す
 */
exports.pushTask = function (json, callback) {
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
};


function runTaskRecipe(task) {
    const langTask = Importer.langTasks[task.json.cmd];
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

    task.uniqueName = task.json.socketid + '/' + task.json.cmd;

    const accepted = [];

    const process = function (taskIndex) {
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
        });
    };
    process(0);
}