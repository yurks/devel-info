module.exports = function(req) {
    var out;
    if (req && req.headers) {
        out = Object.assign({}, req.headers);
        delete out.cookie;
        return out;
    }
};
