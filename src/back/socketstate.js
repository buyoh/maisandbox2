const TaskImporter = require('./taskimporter');
const JobExecutor = require('./jobexecutor');
const Impl = require('./impl/socketstate');

Impl.DI(TaskImporter, JobExecutor);
exports.ConnectionState = Impl.ConnectionState;
