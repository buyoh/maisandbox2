/*
process.argv を key value にする。

example:
$ node hoge.js --foo=bar baz -a
{
    '--foo': 'bar',
    'baz': true,
    '-a' : true
}

*/

function partial(string, sep){
    const a = string.split(sep);
    return [a.shift(), a.join(sep)];
}

function parseArgs(argv){
    const args = {};
    for(let i = 2; i < argv.length; ++i) {
        const e = argv[i];
        if (e.length === 0) continue;
        if (e[1] === '-') {
            const [k, v] = partial(e, '=');
            args[k] = v !== '' ? v : true;
        }
        else if (args[e] === undefined) {
            args[e] = true;
        }
    }
    return args;
}

module.exports = parseArgs(process.argv);
