const assert = require('assert');
const fs = require('fs');
const child_process = require('child_process');


function isExistFile(path){
    try{
        fs.statSync(path);
        return true;
    }catch(err){
        return false;
    }
}

/* ------------------------- */

const cygwin_env_path = ";C:/cygwin64/bin;C:/cygwin64/usr/local/bin;";

/* ------------------------- */


const testjs = require('../../src/back/exec.js');

describe("test of exec.js", function(){
    
    it("rubyの実行結果が取得出来る(exec)", function(done){
        testjs.exec("ruby -e 'p 1+8'", function(err, stdout, stderr){
            assert.equal(!!err, false);
            assert.equal(stdout.trim(), "9");
            done();
        });
    });

    it("コマンドが存在しない時の挙動(exec)", function(done){
        testjs.exec("my_nice_hoge", function(err, stdout, stderr){
            assert.equal(!!err, true);
            done();
        });
    });

    it("ファイル操作が出来る(exec)", function(done){
        testjs.exec("rm ./__e_m_p_t_y__.txt", function(err, stdout, stderr){});
        testjs.exec("touch ./__e_m_p_t_y__.txt", function(err, stdout, stderr){
            assert.equal(!err, true, "touch");
            assert.equal(isExistFile("./__e_m_p_t_y__.txt"), true, "touched");
            testjs.exec("rm ./__e_m_p_t_y__.txt", function(err, stdout, stderr){
                assert.equal(!err, true, "rm");
                assert.equal(isExistFile("./__e_m_p_t_y__.txt"), false, "removed");
                done();
            });
        });
    });

    it("標準入出力を伴う実行が出来る(spawn_fileio)", function(done){
        fs.mkdir("./temp", function(err){});
        process.chdir("./temp");
        fs.writeFileSync("./test.rb","s=gets.chomp;puts s+'#out';STDERR.puts s+'#err'");
        fs.writeFileSync("./in.txt","hello");
        testjs.spawn_fileio("ruby", ["./test.rb"], "./in.txt", "./out.txt", "./err.txt", {}, function(code, json){
            assert.equal(code, 0, "exitcode == 0");
            let stdout = fs.readFileSync("./out.txt", 'UTF-8');
            let stderr = fs.readFileSync("./err.txt", 'UTF-8');

            assert.equal(stdout.trim(), "hello#out", "check stdout");
            assert.equal(stderr.trim(), "hello#err", "check stderr");

            process.chdir("../");
            done();
        });
    });

    it("rubyの実行結果が取得出来る(spawn_buff)", function(done){
        testjs.spawn_buff("ruby", ["-e","'p 8+1'"], "", {}, function(err, code, signal, stdout, stderr){
            assert.equal(err, null, "success");
            assert.equal(code, 0, "exitcode == 0");
            assert.equal(stdout.toString().trim(), "9", "check stdout");
            assert.equal(stderr.toString().trim(), "", "check stderr");
            done();
        });
    });

    it("cygwin環境のg++が呼び出せる", function(done){
        testjs.exec("g++ --version'", {env:{path: cygwin_env_path}}, function(err, stdout, stderr){
            assert.equal(!!err, false);
            assert.equal(stdout.substr(0,3), "g++", "check stdout(g++...)");
            assert.equal(stderr.toString().trim(), "", "no stderr");
            done();
        });
    });

    it("cygwin環境でC++11をコンパイル・実行出来る", function(done){
        fs.mkdir("./temp", function(err){});
        process.chdir("./temp");
    
        let options = {
            env: {PATH: cygwin_env_path}
        };
    
        fs.writeFileSync("./test.cpp",'#include<iostream>\nusing namespace std;\nint main(){string str;cin>>str;cout<<str<<" world"<<endl;return 0;}');
        fs.writeFileSync("./in.txt","hello");

        testjs.spawn_fileio("g++", ["./test.cpp","-std=gnu++14","-o","./test.out"], null, null, "./err.txt", options, function(code, json){
            assert.equal(code, 0, "(compile) exitcode == 0");
            assert.ok(isExistFile("./test.out"), "generated");
            //let stderr = fs.readFileSync("./err.txt", 'UTF-8');
            
            testjs.spawn_fileio("./test.out", [], "./in.txt", "./out.txt", "./err.txt", options, function(code, json){
                assert.equal(code, 0, "exitcode == 0");
                let stdout = fs.readFileSync("./out.txt", 'UTF-8');
                let stderr = fs.readFileSync("./err.txt", 'UTF-8');
    
                assert.equal(stdout.trim(), "hello world", "check stdout");
                // assert.equal(stderr.trim(), "hello#err", "check stderr");
    
                process.chdir("../");
                done();
            });
        });
    });
    
    it("rubyの実行結果が取得出来る(exec, bash)", function(done){
        testjs.exec("bash -c 'ruby -e \"p 8+1\"'", function(err, stdout, stderr){
            assert.equal(!!err, false);
            assert.equal(stdout.trim(), "9");
            done();
        });
    });
    
    it("標準入出力を伴う実行が出来る(spawn_fileio, bash)", function(done){
        fs.mkdir("./temp", function(err){});
        process.chdir("./temp");
        fs.writeFileSync("./test.rb","s=gets.chomp;puts s+'#out';STDERR.puts s+'#err'");
        fs.writeFileSync("./in.txt","hello");
        testjs.spawn_fileio("bash", ["-c", "ruby ./test.rb < in.txt 1> out.txt 2> err.txt"], null, null, null, {}, function(code, json){
            assert.equal(code, 0, "exitcode == 0");
            let stdout = fs.readFileSync("./out.txt", 'UTF-8');
            let stderr = fs.readFileSync("./err.txt", 'UTF-8');

            assert.equal(stdout.trim(), "hello#out", "check stdout");
            assert.equal(stderr.trim(), "hello#err", "check stderr");

            process.chdir("../");
            done();
        });
    });


    // it("標準入出力を伴う実行が出来る(exec_buff)", function(done){
    //     fs.mkdir("./temp", function(err){});
    //     process.chdir("./temp");
    //     fs.writeFileSync("./test.rb","s=gets.chomp;puts s+'#out';STDERR.puts s+'#err'");
    //     testjs.exec_buff("ruby", ["./test.rb"], "hello", function(err, code, signal, stdout, stderr){
    //         assert.equal(err, null, "success");
    //         assert.equal(code, 0, "exitcode == 0");
    //         assert.equal(stdout.toString().trim(), "hello#out", "check stdout");
    //         assert.equal(stderr.toString().trim(), "hello#err", "check stderr");
    // 
    //         process.chdir("../");
    //         done();
    //     });
    // });
});