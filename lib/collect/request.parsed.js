var url = require('url');
var qs = require('querystring');
var requestIp = require('request-ip');
var requestUrl = require('request-url');

module.exports = function(req) {
    if (!req || !req.url) {
        return;
    }
    var fullUrl = requestUrl(req);
    var parsedUrl = url.parse(fullUrl);
    var parsedQuery = qs.parse(parsedUrl.query);

    return {
        'client-ip': requestIp.getClientIp(req),
        'request-url': fullUrl,
        'query': parsedQuery,
        'url': parsedUrl
    };
};
