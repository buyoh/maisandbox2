const assert = require('assert');
const fs = require('fs');


function isExistFile(path){
    try{
        fs.statSync(path);
        return true;
    }catch(err){
        return false;
    }
}


const testjs = require('../../src/back/exec.js');

describe("test of exec.js", function(){

    it("echoの実行結果が取得出来る(exec)", function(accept){
        testjs.exec("echo HELLO", function(err, stdout, stderr){
            assert.equal(stdout.trim(), "HELLO");
            accept();
        });
    });
    
    it("rubyの実行結果が取得出来る(exec)", function(accept){
        testjs.exec("ruby -e 'p 1+8'", function(err, stdout, stderr){
            assert.equal(stdout.trim(), "9");
            accept();
        });
    });

    it("ファイル操作が出来る(exec)", function(accept){
        testjs.exec("rm ./__e_m_p_t_y__.txt", function(err, stdout, stderr){});
        testjs.exec("touch ./__e_m_p_t_y__.txt", function(err, stdout, stderr){
            assert.equal(!err, true, "touch");
            assert.equal(isExistFile("./__e_m_p_t_y__.txt"), true, "touched");
            testjs.exec("rm ./__e_m_p_t_y__.txt", function(err, stdout, stderr){
                assert.equal(!err, true, "rm");
                assert.equal(isExistFile("./__e_m_p_t_y__.txt"), false, "removed");
                accept();
            });
        });
    });

    it("標準入出力を伴う実行が出来る(spawn)", function(accept){
        fs.mkdir("./temp", function(err){});
        process.chdir("./temp");
        fs.writeFileSync("./test.rb","s=gets.chomp;puts s+'#out';STDERR.puts s+'#err'");
        fs.writeFileSync("./in.txt","hello");
        testjs.exec_fileio("ruby", ["./test.rb"], "./in.txt", "./out.txt", "./err.txt", function(code, signal){
            console.log(code);
            assert.equal(code, 0, "exitcode == 0");
            let stdout = fs.readFileSync("./out.txt", 'UTF-8');
            let stderr = fs.readFileSync("./err.txt", 'UTF-8');

            assert.equal(stdout.trim(), "hello#out", "check stdout");
            assert.equal(stderr.trim(), "hello#err", "check stderr");

            process.chdir("../");
            accept();
        });
    });
});