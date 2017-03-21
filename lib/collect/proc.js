var parseError = require('../parse-error');

var prettysize = require('prettysize');
var humanizeDuration = require('humanize-duration');
var durationCfg = {units: ['d', 'h', 'm'], round: true };

var collectProc = function() {
    var memory = process.memoryUsage();
    var out = {
        pid: process.pid,
        uptime: humanizeDuration(process.uptime()*1000, durationCfg)
    };
    var k;
    for (k in memory) {
        if (Object.prototype.hasOwnProperty.call(memory, k)) {
            memory[k] = prettysize(memory[k]);
        }
    }
    Object.assign(out, memory);

    return out;
};

var cluster;
var proc = function() {
    cluster = cluster || require('../cluster');
    if (cluster.initialized) {
        return new Promise(function(resolve) {
            process.send('devel-info: get workers info');
            var getWorkersInfo = function(msg) {
                if (msg && msg.key === 'devel-info: workers info') {
                    msg.data.concat(msg.data[0]);
                    msg.data['#cols'] = 5;
                    resolve(msg.data);
                    process.removeListener('message', getWorkersInfo);
                }
            };
            process.on('message', getWorkersInfo);
        }).catch(function(e) {
            return parseError(e);
        });
    } else {
        return collectProc();
    }
};

proc.raw = collectProc;
module.exports = proc;