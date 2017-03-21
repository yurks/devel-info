module.exports = function(err, data, res, type) {
    if (err) {
        res.writeHead(500);
        if (process.env.NODE_ENV === 'production') {
            res.end('Server error');
        } else {
            res.end(err.stack || (err + ''));
        }
    }

    if (typeof type === 'string') {
        type = type.toLowerCase();
    }
    if (type === 'html') {
        type = 'text/html';
    } else {
        type = 'application/json';
        data = data && JSON.stringify(data, null, 2);
    }

    res.writeHead(200, type && {'Content-Type': type + '; charset=utf-8'});
    res.end(data);
};
