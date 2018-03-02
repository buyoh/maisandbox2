
const fs = require('fs');
const child_process = require('child_process');


/** child_process.exec(command, function(err,stdout, stderr){}); */
exports.exec = child_process.exec;

/**
 * コマンドを実行する
 * @param {string} command 
 * @param {array} args 
 * @param {string} stdinpath 
 * @param {string} stdoutpath 
 * @param {string} stderrpath 
 * @param {(code,signal)=>void} callback コマンド終了時に呼び出される
 */
exports.exec_fileio = function(command, args, stdinpath, stdoutpath, stderrpath, callback){
    const stdin  = fs.openSync(stdinpath, 'r');
    const stdout = fs.openSync(stdoutpath, 'w');
    const stderr = fs.openSync(stderrpath, 'w');

    const proc = child_process.spawn(command, args, {
        detached: true,
        stdio: [stdin, stdout, stderr]
    });

    proc.on("close", function(code, signal){
        callback.call(this, code, signal);
    });
}