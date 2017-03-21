var format = require('../format');
var is = require('is_js');

module.exports = function() {
    var out = format(process, ['cwd', 'title', 'argv', 'argv0', 'execPath', 'execArgv', 'version', 'versions', 'release', 'config'], false);

    var user = {};
    if (process.getuid) {
        user.uid = process.getuid();
    }
    if (process.getgid) {
        user.gid = process.getgid();
    }
    if (process.geteuid) {
        user.euid = process.geteuid();
    }
    if (process.getegid) {
        user.egid = process.getegid();
    }
    if (process.getgroups) {
        user.groups = process.getgroups();
    }

    if (is.not.empty(user)) {
        out['#user'] = user;
    }

    return out;
};
