const assert = require('assert');

/* eslint-env mocha */

const Http = require('./../../../src/back/impl/http');
const FileMock = {
    readFile: () => ({ then: () => Promise.resolve() })
};
Http.DI(FileMock);

describe('[small test] http.js', () => {

    it('[rewritePath] reject parent directory', (done) => {
        assert.equal(Http.rewritePath('/../../a.txt'), null);
        assert.equal(Http.rewritePath('/_/../a.txt'), null);
        assert.equal(Http.rewritePath('/..'), null);
        done();
    });

    it('[rewritePath] built file', (done) => {
        const b = Http.rewritePath('/_/bundle.js');
        assert.ok(b.includes('bundle.js'));
        assert.ok(b.includes('build'));
        done();
    });

    it('[handleHttp] reject', (done) => {
        const req = {
            on: () => undefined,
            url: '/../a.txt'
        };
        const res = {
            on: () => undefined,
            writeHead: () => undefined,
            end: () => { assert.equal(res.statusCode, 403); done(); },
            statusCode: null
        };
        Http.handleHttp(req, res);
    });

});
