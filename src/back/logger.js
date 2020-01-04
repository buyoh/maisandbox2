const Settings = require('./settings');
const settings = Settings.settings;

let enableLog = settings.loglevel >= 4;
let enableInfo = settings.loglevel >= 3;
let enableWarn = settings.loglevel >= 2;
let enableError = settings.loglevel >= 1;
let enableAll = true;

exports.log = function (...args) {
    if (enableLog && enableAll) console.log(...args);
};

exports.info = function (...args) {
    if (enableInfo && enableAll) console.info(...args);
};

exports.warn = function (...args) {
    if (enableWarn && enableAll) console.warn(...args);
};

exports.error = function (...args) {
    if (enableError && enableAll) console.error(...args);
};

// usage: enable({log: false, info: false});
exports.enable = function (sw) {
    if (sw.log !== undefined) enableLog = !!sw.log;
    if (sw.info !== undefined) enableInfo = !!sw.info;
    if (sw.warn !== undefined) enableWarn = !!sw.warn;
    if (sw.error !== undefined) enableError = !!sw.error;
    if (sw.all !== undefined) enableAll = !!sw.all;
};
