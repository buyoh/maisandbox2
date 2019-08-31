const assert = require('assert');
const fs = require('fs');
const mktmpdir = require('mktmpdir');

/* eslint-env mocha */


const testjs = require('../../../src/back/task/util/exec.js');

describe('[unit test] exec.js', () => {

    before((done) => {
        Promise.resolve().then(() => new Promise((resolve, reject) => {
            fs.access('temp', fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if (err) {
                    fs.mkdir('temp', (err) => {
                        err ? reject(err) : resolve();
                    });
                }
                else
                    resolve();
            });
        })).then(() => new Promise((resolve, reject) => {
            fs.access('temp/test', fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if (err) {
                    fs.rmdir('temp/test', () => {
                        fs.mkdir('temp/test', (err) => {
                            err ? reject(err) : resolve();
                        });
                    });
                }
                else
                    resolve();
            });
        })).then(() => done()).catch((err) => done(err));
    });

    it('rubyの実行結果が取得出来る(exec)', (done) => {
        testjs.exec('ruby -e \'p 1+8\'', (err, stdout, stderr) => {
            assert.equal(!!err, false);
            assert.equal(stdout.trim(), '9');
            assert.equal(stderr.trim(), '');
            done();
        });
    });

    it('コマンドが存在しない時の挙動(exec)', (done) => {
        testjs.exec('my_nice_hoge', (err) => {
            assert.equal(!!err, true);
            done();
        });
    });

    it('ファイル操作が出来る(exec)', (done) => {
        Promise.resolve().then(() => new Promise((resolve) => {
            testjs.exec('echo foobar > temp/test/fstest.txt', (err) => {
                assert.equal(!!err, false, 'write file');
                resolve();
            });
        })).then(() => new Promise((resolve) => {
            fs.access('temp/test/fstest.txt', fs.constants.F_OK, (err) => {
                assert.equal(!!err, false, 'file exists');
                resolve();
            });
        })).then(() => new Promise((resolve) => {
            testjs.exec('rm temp/test/fstest.txt', (err) => {
                assert.equal(!!err, false, 'remove file');
                resolve();
            });
        })).then(() => new Promise((resolve) => {
            fs.access('temp/test/fstest.txt', fs.constants.F_OK, (err) => {
                assert.equal(!!err, true, 'file does not exist');
                resolve();
            });
        })).then(() => done()).catch((err) => done(err));
    });

    it('標準入出力を伴う実行が出来る(spawn_fileio)', (done) => {
        process.chdir('./temp');
        mktmpdir((err, tempdir) => {
            if (err) { done(err); return; }
            process.chdir(tempdir);

            fs.writeFileSync('./test.rb', 's=gets.chomp;puts s+\'#out\';STDERR.puts s+\'#err\'');
            fs.writeFileSync('./in.txt', 'hello');
            testjs.spawn_fileio('ruby', ['./test.rb'], './in.txt', './out.txt', './err.txt', {}, (code) => {
                assert.equal(code, 0, 'exitcode == 0');
                let stdout = fs.readFileSync('./out.txt', 'UTF-8');
                let stderr = fs.readFileSync('./err.txt', 'UTF-8');

                assert.equal(stdout.trim(), 'hello#out', 'check stdout');
                assert.equal(stderr.trim(), 'hello#err', 'check stderr');

                process.chdir('../');
                testjs.exec('rm -rf ' + tempdir, () => {
                    process.chdir('../');
                    done();
                });
            });
        });
    });

    it('rubyの実行結果が取得出来る(spawn_buff)', (done) => {
        testjs.spawn_buff('ruby', ['-e', 'p 8+1'], '', {}, (err, code, signal, stdout) => {
            assert.equal(err, null, 'success');
            assert.equal(code, 0, 'exitcode == 0');
            assert.ok(stdout.toString().startsWith('9\n'), 'check stdout');
            done();
        });
    });

});