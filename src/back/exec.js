
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
exports.spawn_fileio = function(command, args, stdinpath, stdoutpath, stderrpath, options, callback){
    const stdin  = stdinpath  !== null ? fs.openSync(stdinpath,  'r') : 'ignore';
    const stdout = stdoutpath !== null ? fs.openSync(stdoutpath, 'w') : 'ignore';
    const stderr = stderrpath !== null ? fs.openSync(stderrpath, 'w') : 'ignore';
    
    //let env_old = options.path

    const ps = child_process.spawn(command, args, Object.assign({
        stdio: [stdin, stdout, stderr]
    }, options));

    ps.on("close", function(code, signal){
        callback(code, signal);
    });

    return function(){
        if (!ps.killed) ps.kill();
    }
}
/**
 * ファイルを介さずに実行
 * @param {string} command 
 * @param {array} args 
 * @param {string} stdin
 * @param {(err, code, signal, stdout, stderr)=>void} callback コマンド終了時に呼び出される
 */
exports.spawn_buff = function(command, args, stdin, options, callback){

    const ps = child_process.spawn(command, args, options);
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
            callback(null, endcode, endsignal, buffstdout, buffstderr);
    }

    ps.on("err", function(err){
        callback(err, endcode, endsignal, buffstdout, buffstderr);
    });
}