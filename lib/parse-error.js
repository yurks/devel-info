module.exports = function(e) {
    return {
        '#error': {
            name: e.name,
            message: e.message,
            stack: e.stack,
        }
    };
};