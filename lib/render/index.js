var tpl = require('./templates');

module.exports = function(config, data, cb) {
    if (config.type === 'html') {
        tpl('table', data, cb);
    } else {
        cb(null, data);
    }
};
