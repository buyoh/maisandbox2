
const argv = require('./argv');

const defaultSettings = {
    portno: 11450,
    hostname: 'localhost',
    loglevel: 1
};

exports.settings = (() => {
    const settings = Object.assign({}, defaultSettings);

    if (argv['--port']) settings.portno = parseInt(argv['--port']);
    if (argv['--log']) settings.loglevel = parseInt(argv['--log']); // 0=nolog, 1=erroronly, 4=all

    return settings;
})();