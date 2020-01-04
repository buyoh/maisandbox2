const fs = require('fs');
const FileUtil = require('./fileutil');

// temperaser を実行する周期
const interval = 1000 * 60 * 60 * 2;
// もし ./temp 上に lifeTime msec 以上アクセスされていないファイルがあれば，削除する
const lifeTime = 1000 * 60 * 60 * 2;

setTimeout(loop, 0);


function loop() {
    const time = (new Date).getTime();

    fs.readdir('./temp', (err, files) => {
        if (err) return;
        for (let file of files) {
            fs.stat('./temp/' + file, (err, stat) => {
                if (err) return;
                if (stat.atimeMs + lifeTime < time) {
                    FileUtil.removeRecursive('./temp/' + file, (err) => {
                        if (err) console.error('removeRecursive: ' + err);
                    });
                }
            });
        }
    });

    setTimeout(loop, interval);
}
