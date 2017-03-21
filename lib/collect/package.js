var format = require('../format');

module.exports = function() {

    var dir = __dirname.replace(/\\/g, '/');
    var last_index = dir.lastIndexOf('/node_modules/');
    var root = last_index > 0 ? dir.slice(0, last_index) : null;
    var out;

    if (root) {
        var packageJson;
        try {
            packageJson = require(root + '/package.json');
        } catch (e) {}

        if (packageJson) {
            out = format(packageJson, ['name', 'version', 'description', 'homepage', 'repository', 'dependencies', 'author', 'license'], false);
            if (out.dependencies) {
                out.dependencies = Object.keys(out.dependencies).join(', ');
            }
            return out;
        }
    }
};
