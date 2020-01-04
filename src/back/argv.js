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

const ArgvImpl = require('./impl/argv');
module.exports = ArgvImpl.parseArgs(process.argv);
