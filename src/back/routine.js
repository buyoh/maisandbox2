
const FILENAME_STDIN  = 'stdin.txt';
const FILENAME_STDOUT = 'stdout.txt';
const FILENAME_STDERR = 'stderr.txt';

const routines = [
    {
        name: 'C++(cyg)',
        env:  'cyg',
        codefilename: 'code.cpp',
        compile: [
            {
                cmd: ['g++','std=c++14','-O3','-o','code.out','code.cpp']
            }
        ],
        execute: [
            {
                cmd: ['./code.out'],
                stdinpath: FILENAME_STDIN,
                stdoutpath: FILENAME_STDOUT,
                stderrpath: FILENAME_STDERR
            }
        ]
    }
];