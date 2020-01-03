export function validateRecipe(script, commandList) {
    for (let s of script) {
        if (!commandList[s]) return false;
    }
}

export function runJobRecipe(job, script, commandList, callback) {

    const accepted = [];

    const process = (scriptIndex) => {
        if (scriptIndex >= script.length) {
            callback('success', {}, true);
            return;
        }
        commandList[script[scriptIndex]](job, (msg, json = {}) => {
            json.commandName = script[scriptIndex];
            callback(msg, json);
            if (msg === 'continue' && !accepted[scriptIndex]) {
                accepted[scriptIndex] = true;
                process(scriptIndex + 1);
            }
        });
    };
    process(0);
}