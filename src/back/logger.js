const settings = require('./settings').settings;

let enableLog = settings.loglevel >= 4;
let enableInfo = settings.loglevel >= 3;
let enableWarn = settings.loglevel >= 2;
let enableError = settings.loglevel >= 1;
let enableAll = true;

export function log(...args) {
    if (enableLog && enableAll) console.log(...args);
}

export function info(...args) {
    if (enableInfo && enableAll) console.info(...args);
}

export function warn(...args) {
    if (enableWarn && enableAll) console.warn(...args);
}

export function error(...args) {
    if (enableError && enableAll) console.error(...args);
}

// usage: enable({log: false, info: false});
export function enable(sw) {
    if (sw.log !== undefined) enableLog = !!sw.log;
    if (sw.info !== undefined) enableInfo = !!sw.info;
    if (sw.warn !== undefined) enableWarn = !!sw.warn;
    if (sw.error !== undefined) enableError = !!sw.error;
    if (sw.all !== undefined) enableAll = !!sw.all;
}
