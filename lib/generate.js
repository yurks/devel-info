var parseError = require('./parse-error');
var collectDevel = require('./collect/devel');
var render = require('./render');
var is = require('is_js');

var develInfo = collectDevel();
var develInfoName = develInfo.name;
var develInfoFooter = develInfo.footer;
delete develInfo.name;
delete develInfo.footer;


module.exports = function(config, cb, req) {

    var out = {};

    if (config.sections._default) {
        out[develInfoName] = develInfo;
    }

    var promises;
    out = config.sections.reduce(function(out, key) {
        if (key && !(key in out)) {
            if (typeof key === 'string') {
                try {
                    out[key] = require('./collect/' + key + '.js')(req);
                } catch(e) {
                    out[key] = parseError(e);
                }
            } else if (typeof key === 'object') {
                Object.assign(out, key);
            }
            if (key === 'package' && out[key] && out[key].name) {
                out[out[key].name] = out[key];
                delete out[key].name;
                delete out[key];
                delete out[develInfoName];

            } else if (out[key] && is.function(out[key].then)) {
                promises = promises || [];
                promises.push(key);

            } else if (!out[key] || is.empty(out[key])) {
                delete out[key];
            }
        }
        return out;

    }, out);

    if (!out[develInfoName]) {
        out[develInfoName] = develInfoFooter;
    }

    if (promises) {
        Promise.all(promises.map(function(key) {
            return out[key];

        })).then(function(resolved) {
            resolved.forEach(function(data, i) {
                out[promises[i]] = data;
            });
            render(config, out, cb);
        });

    } else {
        render(config, out, cb);
    }
};
