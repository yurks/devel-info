var fs = require('fs');
var path = require('path');
var is = require('is_js');


function _traverse(value, theme, depth, long_key, _renderObjectAsIs) {
    long_key = long_key || '';
    depth = depth || 0;
    if (depth < 2) {
        long_key = '';
    }
    var i, length, key, out = '', sub, _isNestedObject;
    if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
            length = {
                total: value.length,
                cols: value['#cols'] || (is.json(value[0]) ? 2 : (value.join(', ').length > 80 ? 5 : 0))
            };
            for (i = 0; i < value.length; i++) {
                length.index = i;
                sub = _traverse(value[i], theme, depth);
                if (sub) {
                    out += theme.$renderItem(i, sub, depth, length);
                }
            }
            if (out) {
                delete length.index;
                out = theme.$renderItem(true, out, depth, length);
            } else {
                out = theme.$renderItem([]);
            }
        } else {
            for (key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    _isNestedObject = !!(depth > 0 && value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]));

                    sub = _traverse(value[key], theme, depth+1, (long_key && long_key+'.') + key, _isNestedObject);
                    if (sub) {
                        if (_isNestedObject) {
                            out += sub;
                        } else {
                            out += theme.$renderItem((long_key && long_key+'.') + key, sub, depth);
                        }
                    }
                }
            }
            if (!out) {
                if (depth > 1 && _renderObjectAsIs) {
                    out = theme.$renderItem(long_key, theme.$renderItem({}), depth);
                }
            }
            if (out) {
                if (!_renderObjectAsIs) {
                    out = theme.$renderItem(true, out, depth);
                }
            } else {
                out = theme.$renderItem({});
            }
        }
    } else {
        out = theme.$renderItem(value);
    }
    return out;
}


function renderTemplate(tpl, data, key, depth, length) {
    return new Function('data', 'key', 'depth', 'length', 'return `' + tpl + '`;')(data, key, depth, length); // jshint ignore:line
}

var re_url = /(([a-z]+:\/|www\.|ftp\.)[0-9a-z\-_\/?&=\[\]#.:~@+]*)/gi;
var re_version = /^[v=^><]?[0-9.]+([a-z]|-[a-z0-9.+]*)?$/i;
var re_number = /^(-?\d+|-?Infinity|NaN)$/;
var re_port = /:\d{1,5}\/?$/;
var re_bool_true = /^true|yes/i;
var re_bool_false = /^false|no$/i;

function _renderItem(key, value, depth, length) {
    var theme = this;
    if (arguments.length === 1) {
        value = key;
        var type = typeof value;
        if (type === 'object') {
            if (!value) {
                type = 'null';
            } else if (Array.isArray(value)) {
                type = 'array';
                value = '<span title="empty array">[]</span>';
            } else {
                value = '<span title="empty object">{}</span>';
            }
        } else if (type === 'string') {
            if (value === '') {
                value = '<span title="empty string"></span>';
            } else if (re_bool_true.test(value) || re_bool_false.test(value)) {
                type = 'boolean-' + re_bool_true.test(value);
            } if (value === 'null' || value === 'undefined') {
                type = value;
            } else if (re_number.test(value) || is.hexadecimal(value)) {
                type = 'number';
            } else if (is.ip(value) || is.ip(value.replace(re_port, ''))) {
                type = 'ip';
            } else if (re_version.test(value)) {
                type = 'version';
            } else {
                value = value.replace(re_url, '<a href="$1" target="_blank">$1</a>');
            }

        } else if (type === 'boolean') {
            type += '-' + value;
        }
        return renderTemplate(theme.value, value, type, depth, length);

    } else if (length) {
        return renderTemplate(key === true ? theme.arrayWrapper : theme.arrayItem, value, key, depth, length);

    } else if (depth === 0) {
        return renderTemplate(key === true ? theme.rootWrapper : theme.rootItem, value, key, depth, length);
    } else {
        return renderTemplate(key === true ? theme.objectWrapper : theme.objectItem, value, key, depth, length);
    }
}

function _render(data) {
    var _this = this;
    return renderTemplate(_this.layout, {style: _this. style, html: _traverse(data, this), data: data});
}

var templatesCache = {};
function readTheme(dirName, data, done) {
    if (templatesCache[dirName]) {
        return done(null, templatesCache[dirName].$render(data));
    }
    var dir = path.join(__dirname, dirName);
    fs.readdir(dir, function(err, files) {
        if (err) {
            return done(err);
        }
        var store = {
            $renderItem: _renderItem,
            $render: _render
        };

        var total = 0;
        files.forEach(function(fileName) {
            fs.readFile(path.join(dir, fileName), 'utf8', function(err, content) {
                if (err) {
                    return done(err);
                }
                store[path.basename(fileName, path.extname(fileName))] = content;
                if (++total === files.length) {
                    templatesCache[dirName] = store;
                    done(null, store.$render(data));
                }
            });
        });
    });
}

module.exports = readTheme;