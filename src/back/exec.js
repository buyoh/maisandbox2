
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
exports.spawn_fileio = function(command, args, stdinpath, stdoutpath, stderrpath, callback){
    const stdin  = fs.openSync(stdinpath, 'r');
    const stdout = fs.openSync(stdoutpath, 'w');
    const stderr = fs.openSync(stderrpath, 'w');

    const ps = child_process.spawn(command, args, {
        stdio: [stdin, stdout, stderr]
    });

    ps.on("close", function(code, signal){
        callback.call(this, code, signal);
    });
}
/**
 * ファイルを介さずに実行
 * @param {string} command 
 * @param {array} args 
 * @param {string} stdin
 * @param {(err, code, signal, stdout, stderr)=>void} callback コマンド終了時に呼び出される
 */
exports.spawn_buff = function(command, args, stdin, callback){

    const ps = child_process.spawn(command, args, {});
    if (stdin !== null && stdin != "")
        ps.stdin.write(stdin);
    ps.stdin.end();

    let buffstdout = new Buffer("");
    let buffstderr = new Buffer("");

    let endflg = 0;
    let endcode = -1;
    let endsignal = "";

    ps.stdout.on("data", function(data){
        buffstdout.write(data.toString());
    });
    ps.stderr.on("data", function(data){
        buffstderr.write(data.toString());
    });
    ps.stdout.on("end", function(){ endflg |= 1; checkTermination();});
    ps.stderr.on("end", function(){ endflg |= 2; checkTermination();});
    ps.on("close", function(code, signal){
        endcode = code;
        endsignal = signal;
        endflg |= 4;
        checkTermination();
    });

    function checkTermination(){
        if (endflg == 7)
            callback.call(this, null, endcode, endsignal, buffstdout, buffstderr);
    }

    ps.on("err", function(err){
        callback.call(this, err, endcode, endsignal, buffstdout, buffstderr);
    });
}