const assert = require('assert');

/* eslint-env mocha */

const Argv = require('./../../../src/back/impl/argv');

describe('[small test] argv.js', () => {

    it('keyvalue', (done) => {
        const prm = Argv.parseArgs(['node', 'hoge.js', '--a=b', '-c=d', '--b', '-d', 'e']);
        assert.equal(prm['--a'], 'b');
        assert.equal(prm['-c'], 'd');
        done();
    });

    it('flag', (done) => {
        const prm = Argv.parseArgs(['node', 'hoge.js', '--a=b', '-c=d', '--b', '-d', 'e']);
        assert.equal(prm['--b'], true);
        assert.equal(prm['-d'], true);
        assert.equal(prm['e'], true);
        done();
    });

    it('sample', (done) => {
        assert.equal(
            Argv.parseArgs(['node', 'hoge.js', '--foo=bar', 'baz', '-a']),
            {
                '--foo': 'bar',
                'baz': true,
                '-a': true
            }
        );
        done();
    });
});