var cookie = require('cookie');

module.exports = function(req) {
    if (req && req.headers && req.headers.cookie) {
        return cookie.parse(req.headers.cookie);
    }
};
