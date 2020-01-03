const Logger = require('./logger');
const SocketIO = require('./socketio');
const Http = require('./http');

//

const settings = require('./settings').settings;
Logger.info('port: ' + settings.portno);

//

const server = Http.setup(settings.portno, settings.hostname);
SocketIO.setup(server);
