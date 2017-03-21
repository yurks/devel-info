var generate = require('./generate');
var response = require('./response');

var is = require('is_js');

var url = require('url');

var develInfo = function(config, cb, req) {
    if (is.function(config)) {
        req = cb;
        cb = config;
        config = null;

    } else if (is.array(config) || is.string(config)) {
        config = {
            sections: is.string(config) ? [config] : config
        };
    }

    config = config || {};
    config.url = config.url || '/devel-info';
    var sections = ['package', 'proc', config.custom, 'request', 'request.parsed', 'request.headers', 'request.headers.cookie', 'os', 'process', 'process.env', 'os.networkInterfaces'];
    sections._default = true;
    config.sections = config.sections || sections;

    if (typeof cb === 'function') {
        config.type = config.type || 'json';
        return generate(config, cb, req);

    } else {
        config.type = config.type || 'html';
        return function(req, res, next) {
            if (url.parse(req.url).pathname === config.url) {
                generate(config, function(err, data) {
                    response(err, data, res, config.type);
                }, req);

            } else if (is.function(next)) {
                next();
            }
        };
    }
};

develInfo.initCluster = require('./cluster').initCluster;
module.exports = develInfo;


