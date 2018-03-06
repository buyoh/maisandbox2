const assert = require('assert');
const fs = require('fs');



const testjs = require('../../src/back/taskexecutor.js');

describe("test of taskexecutor.js", function(){
    
    it("hello world", function(done){
        const info = {
            txt_stdin: "",
            txt_code: "puts 'hello world'",
            cmd: "Ruby"
        };
        let state = 0;
        testjs.pushTask(info, function(type, json){
            if (state === 0){
                assert.equal(type, "prepare", "準備開始");
            }else if (state === 1){
                assert.equal(type, "compile", "syntax");
            }else if (state === 2){
                assert.equal(type, "execute", "実行開始");
            }else if (state === 3){
                assert.equal(type, "success", "プロセスは終了した");
                assert.equal(json.code, 0, "プロセスは正常終了した");
                assert.equal(json.stderr.trim(), "", "標準エラー");
                assert.equal(json.stdout.trim(), "hello world", "標準出力");
                done();
            }else{
                assert.fail(""+(state+1)+"回目のcallbackでtype("+type+")を得た");
            }
            ++state;
        });
    });

    it("kill", function(done){
        const info = {
            txt_stdin: "",
            txt_code: "sleep 5;puts 'goodmorning'",
            cmd: "Ruby"
        };
        let state = 0;
        testjs.pushTask(info, function(type, json){
            if (state === 0){
                assert.equal(type, "prepare", "準備開始");
            }else if (state === 1){
                assert.equal(type, "compile", "syntax");
            }else if (state === 2){
                assert.equal(type, "execute", "実行開始");
                json.killer();
            }else if (state === 3){
                assert.equal(type, "success", "プロセスは終了した");
                assert.notEqual(json.code, 0, "プロセスは異常終了した");
                done();
            }else{
                assert.fail(""+(state+1)+"回目のcallbackでtype("+type+")を得た");
            }
            ++state;
        });
    });
});