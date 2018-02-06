const child_process = require('child_process');

// cmd        : 
// param      : 
// stdin      : 
// environment: {}
// callback   : function(code,stdout,stderr){}
function execute(cmd, param, stdin, stdout_path, stderr_path, environment, callback){
    const out = fs.openSync(stdout_path, 'w');
    const err = fs.openSync(stderr_path, 'w');

    let env = environment;
    env['stdio'] = [ 'ignore', out, err ];

    const p = child_process.spawn(cmd, param);
    p.stdin.write(stdin);
    
    // let stdout = "", stderr = "";
    // p.stdout.on('data', function(x){ stdout += x; });
    // p.stderr.on('data', function(x){ stderr += x; });

    p.on('close', function(code){
        callback.call({code, stdout, stderr});
        p.stdin.end();
        detached: true
    });
}