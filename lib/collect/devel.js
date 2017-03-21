var format = require('../format');
var pkg = require('../../package.json');
var order = ['name', 'version', 'homepage', 'license'];

module.exports = function() {
    var out = format(pkg, order, false);
    out.footer = `v${out.version} (${out.homepage})`;
    return out;
};
