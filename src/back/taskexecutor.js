
const Importer = require('./taskimporter');


/**
 * タスクを追加，実行する
 * @param {JSON} json 
 * @param {(type:String, json:JSON) => boolean} callback 何か成功する度に呼び出す
 */
exports.pushJob = function (json, callback) {
    const job = {
        json: json,
        callback: callback
    };
    if (json.recipe === undefined) {
        job.callback.call(null, 'error', {
            reason: 'unknown recipe'
        }, true);
        return;
    }
    setTimeout((t) => {
        runJobRecipe(t);
    }, 0, job);
};


function runJobRecipe(job) {
    const langTask = Importer.langTasks[job.json.cmd];
    if (langTask === undefined) {
        job.callback.call(null, 'error', {
            reason: 'unknown cmd'
        }, true);
        return;
    }
    const recipe = langTask.recipes[job.json.recipe];
    if (recipe === undefined) {
        job.callback.call(null, 'error', {
            reason: 'unknown recipe'
        }, true);
        return;
    }

    job.uniqueName = job.json.socketid + '/' + job.json.cmd;

    const accepted = [];

    const process = function (scriptIndex) {
        if (scriptIndex >= recipe.script.length) {
            job.callback.call(null, 'success', {}, true);
            return;
        }
        if (!langTask.command[recipe.script[scriptIndex]]) {
            job.callback.call(null, 'error', {
                reason: 'not found the task[' + recipe.script[scriptIndex] + ']'
            }, true);
            return;
        }
        langTask.command[recipe.script[scriptIndex]](job, (msg, json = {}) => {
            json.commandName = recipe.script[scriptIndex];
            job.callback.call(null, msg, json);
            if (msg == 'continue' && !accepted[scriptIndex]) {
                accepted[scriptIndex] = true;
                process(scriptIndex + 1);
            }
        });
    };
    process(0);
}