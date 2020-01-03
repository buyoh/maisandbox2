const Impl = require('./impl/socketstate');

Impl.DI(require('./taskimporter'), require('./jobexecutor'));
exports.ConnectionState = Impl.ConnectionState;
