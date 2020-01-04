const File = require('./file');
const FileUtil = require('./fileutil');
const Logger = require('./logger');

// temperaser を実行する周期
const interval = 1000 * 60 * 60 * 2;
// もし ./temp 上に lifeTime msec 以上アクセスされていないファイルがあれば，削除する
const lifeTime = 20000;//1000 * 60 * 60 * 2;


function loop() {
    const time = (new Date).getTime();

    File.listdir('./temp').then((files) =>
        Promise.all(files.map((file) =>
            File.stat('./temp/' + file).then((stat) =>
                (lifeTime < time - stat.atimeMs) ?
                    FileUtil.removeRecursive('./temp/' + file)
                        .then(() => Logger.log('temperaser: remove ' + file)) :
                    Promise.resolve()
            )
        ))
    ).catch((err) => Logger.error('temperaser(error): ', err));

    setTimeout(loop, interval);
}

setTimeout(loop, 0);
