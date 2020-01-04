const Impl = require('./impl/fileutil');
const File = require('./file');
Impl.DI(File);

exports.removeRecursive = Impl.removeRecursive;
