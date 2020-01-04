/**
 * @type import("../file")
 */
let File;
exports.DI = function (_File) {
    File = _File;
};

function removeRecursive(path) {
    return File.check(path).then(([, isDir]) =>
        (!isDir) ?
            File.unlink(path) :
            File.listdir(path).then((files) =>
                Promise.all(
                    files.map((file) => removeRecursive(path + '/' + file))
                ).then(() => File.rmdir(path, true))
            )
    );
}

exports.removeRecursive = removeRecursive;
