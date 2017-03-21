module.exports = function(o, order, add_remain) {
    var out = {};
    var i, key;

    if (o) {
        for (i = 0; i < order.length; i++) {
            key = order[i];
            if (key in o) {
                if (typeof o[key] === 'function') {
                    out[key] = o[key]();
                } else if (key in o) {
                    out[key] = o[key];
                }
                if (add_remain !== false) {
                    delete o[key];
                }
            }
        }

        if (add_remain !== false) {
            out = Object.assign(out, o);
        }
    }
    return out;
};
