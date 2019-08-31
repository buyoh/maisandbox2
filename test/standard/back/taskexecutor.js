const assert = require('assert');
// const fs = require('fs');

/* eslint-env mocha */


const testjs = require('../../../src/back/taskexecutor.js');

describe('[middle test] taskexecutor.js', () => {

    it('ruby execution', (done) => {
        const info = {
            socketid: 'test_rubyexec',
            recipe: 'check > run',
            txt_stdins: [''],
            txt_code: 'puts \'hello world\'',
            cmd: 'Ruby'
        };
        let state = 0;
        testjs.pushTask(info, (type, json) => {
            setTimeout(() => {
                if (state === 0) {
                    if (type === 'progress') return;
                    assert.equal(type, 'continue', 'continue?');
                    assert.equal(json.taskName, 'setupAll', 'taskName');
                } else if (state === 1) {
                    if (type === 'progress') return;
                    assert.equal(type, 'continue', 'continue');
                    assert.equal(json.taskName, 'check', 'taskName');
                } else if (state === 2) {
                    if (type === 'progress') return;
                    assert.equal(type, 'ac', 'accepted');
                    assert.equal(json.taskName, 'run', 'taskName');
                    assert.equal(json.code, 0, 'プロセスは正常終了した');
                    assert.equal(json.stderr.trim(), '', '標準エラー');
                    assert.equal(json.stdout.trim(), 'hello world', '標準出力');
                } else if (state === 3) {
                    if (type === 'progress') return;
                    assert.equal(type, 'continue', 'continue');
                    assert.equal(json.taskName, 'run', 'taskName');
                } else if (state === 4) {
                    assert.equal(type, 'success', 'success');
                    done();
                } else {
                    assert.fail('' + (state + 1) + '回目のcallbackでtype(' + type + ')を得た:');
                }
                ++state;
            }, 0);
        });
    });

    it('kill test', (done) => {
        const info = {
            socketid: 'test_kill',
            recipe: 'check > run',
            txt_stdins: [''],
            txt_code: 'sleep 5;puts \'goodmorning\'',
            cmd: 'Ruby'
        };
        let state = 0;
        testjs.pushTask(info, (type, json) => {
            setTimeout(() => {
                if (state === 0) {
                    if (type === 'progress') return;
                    assert.equal(type, 'continue', 'continue?');
                    assert.equal(json.taskName, 'setupAll', 'taskName');
                } else if (state === 1) {
                    if (type === 'progress') return;
                    assert.equal(type, 'continue', 'continue');
                    assert.equal(json.taskName, 'check', 'taskName');
                } else if (state === 2) {
                    if (type === 'progress') {
                        json.killer(); // KILL
                        return;
                    }
                    assert.equal(type, 'wa', 'failed');
                    assert.equal(json.taskName, 'run', 'taskName');
                    assert.notEqual(json.code, 0, 'プロセスは異常終了した');
                    done();
                } else if (state === 3) {
                    if (type === 'progress') return;
                    assert.equal(type, 'failed', 'continue');
                    assert.equal(json.taskName, 'run', 'taskName');
                } else if (state === 4) {
                    assert.equal(type, 'success', 'success');
                    done();
                } else {
                    assert.fail('' + (state + 1) + '回目のcallbackでtype(' + type + ')を得た:');
                }
                ++state;
            }, 0);
        });
    });
});