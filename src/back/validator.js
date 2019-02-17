/**
 * 
 * @param {JSON} json 
 */
exports.checkTaskSubmission = function(json) {
    // TODO:
    // TODO: (stdins)等に不正なファイル名送信があった場合にその項目を消す．
    return true;
}

/**
 * 
 * @param {JSON} json 
 */
exports.checkTaskExecution = function(json) {
    // TODO:
    return true;
}


/**
 * 
 * @param {string} raw 
 */
function toSafeFilename(raw) {
    if (raw.match(/^[0-9A-Za-z]+$/)) return raw;
    let s = "";
    for (let i = 0; i < raw.length; ++i)
        s += ("0" + raw.charCodeAt(i).toString(16)).substr(-2);
    return s;
}