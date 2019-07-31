
const argv = require('./argv');

const enableLog = !!argv['--log'];

exports.log = function(...args) {
    if (enableLog) console.log(...args);
};

exports.info = function(...args) {
    console.info(...args);
};

exports.error = function(...args) {
    console.error(...args);
};