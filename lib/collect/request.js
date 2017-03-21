var format = require('../format');

var order = ['httpVersion', 'url', 'originalUrl', 'method'];
module.exports = function(req) {
    return format(req, order, false);
};
