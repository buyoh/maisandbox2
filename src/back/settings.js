
const argv = require('./argv');

const defaultSettings = {
    portno: 11450,
    hostname: 'localhost'
};

exports.settings = (()=>{
    const settings = Object.assign({}, defaultSettings);
    
    if (argv['--port']) settings.portno = parseInt(argv['--port']);

    return settings;
})();