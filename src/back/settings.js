
const defaultSettings = {
    portno: 11450,
    hostname: 'localhost'
};

exports.settings = (()=>{
    const settings = Object.assign({}, defaultSettings);
    
    // read argv
    for (let i = 2, m = null; i < process.argv.length; ++i) {
        const arg = process.argv[i];
        if (arg == '--port') m = 1;
        else if (m == 1) settings.portno = +arg, m = null;
    }

    return settings;
})();