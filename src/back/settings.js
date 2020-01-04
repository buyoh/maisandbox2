const Argv = require('./argv');

const defaultSettings = {
    portno: 11450,
    hostname: 'localhost',
    loglevel: 4
};

exports.settings = (() => {
    const settings = Object.assign({}, defaultSettings);

    if (Argv['--port']) settings.portno = parseInt(Argv['--port']);
    if (Argv['--log']) settings.loglevel = parseInt(Argv['--log']); // 0=nolog, 1=erroronly, 4=all

    return settings;
})();