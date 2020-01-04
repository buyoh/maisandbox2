const Importer = require('./taskimporter');
const Impl = require('./impl/jobexecutor');

/**
 * タスクを追加，実行する
 * @param {JSON} json 
 * @param {(type:String, json:JSON) => boolean} callback 何か成功する度に呼び出す
 */
function pushJob(json, callback) {
    const job = { // TODO: refactor me
        json: json,
        callback: callback
    };
    if (!json.recipe || !Importer.isValid(json.cmd, json.recipe)) {
        job.callback('error', {
            reason: 'invalid recipe'
        }, true);
        return;
    }
    setTimeout((t) => {
        runJobRecipe(t);
    }, 0, job);
}


function runJobRecipe(job) {
    const langTask = Importer.tasks[job.json.cmd];
    const recipe = langTask.recipes[job.json.recipe];

    job.uniqueName = job.json.socketid + '/' + job.json.cmd;

    Impl.runJobRecipe(job, recipe.script, langTask.command, job.callback);

}


exports.pushJob = pushJob;
