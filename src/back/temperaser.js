const fs = require('fs');

// temperaser を実行する周期
const interval = 1000*60*60*2;
// もし ./temp 上に lifeTime msec 以上アクセスされていないファイルがあれば，削除する
const lifeTime = 1000*60*60*2;

setTimeout(loop ,0);

/**
 * ファイルまたはフォルダを(再帰的に)削除
 * @param {string} path 
 * @param {(err: NodeJS.ErrnoException)=>void} callback 
 */
function removeRecursive(path, callback) {
    fs.stat(path, (err, stat)=>{
        if (err){ callback(err); return; }
        if (!stat.isDirectory()){
            fs.unlink(path, callback);
        }
        else{
            fs.readdir(path, (err, files)=>{
                if (err){ callback(err); return; }
                let count = files.length;
                for (let file of files){
                    removeRecursive(path+"/"+file, (err)=>{
                        if (err){
                            if (count >= 0)
                                callback(err), // 2つ以上のエラーを送信しない
                                count = -1;
                            return;
                        }
                        if (--count == 0)
                            fs.rmdir(path, callback);
                    });
                }
                if (files.length == 0){
                    fs.rmdir(path, callback);
                }
            });
        }
    });
}


function loop(){
    const time = (new Date).getTime();

    fs.readdir("./temp", (err, files)=>{
        if (err) return;
        for (let file of files){
            fs.stat("./temp/"+file, (err, stat)=>{
                if (err) return;
                if (stat.atimeMs + lifeTime < time){
                    removeRecursive("./temp/"+file, (err)=>{
                        if (err) console.error("removeRecursive: "+err);
                    });
                }
            });
        }
    });

    setTimeout(loop ,interval);
}