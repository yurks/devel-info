var os = require('os');
var prettysize = require('prettysize');
var humanizeDuration = require('humanize-duration');
var format = require('../format');
var durationCfg = {units: ['d', 'h', 'm'], round: true };

module.exports = function(req, order) {
    var i, k;
    var out = {};

    for (k in os) {
        if (Object.prototype.hasOwnProperty.call(os, k) && typeof os[k] === 'function') {
            if (k !== 'tmpDir' && k !== 'getNetworkInterfaces' && k !== 'networkInterfaces') {
                out[k] = os[k]();
            }
        }
    }
    out.uptime = humanizeDuration(out.uptime*1000, durationCfg);
    out.loadavg.forEach(function(l, i, loadavg) { loadavg[i] = l.toFixed(2); });
    out.loadavg = out.loadavg.join(' ');
    out.freemem = prettysize(out.freemem) + ' (' + Math.round(out.freemem/out.totalmem*100) + '%)';
    out.totalmem = prettysize(out.totalmem);

    var cpusTmp = { model: {}, speed: {} };
    var cpusOrig = os.cpus();
    for (i = 0; i < cpusOrig.length; i++) {
        cpusTmp.model[cpusOrig[i].model] = (cpusTmp.model[cpusOrig[i].model] || 0) + 1;
        cpusTmp.speed[cpusOrig[i].speed] = (cpusTmp.speed[cpusOrig[i].speed] || 0) + 1;
    }
    var cpus = { model: [], speed: [] };
    for (k in cpusTmp.model) {
        if (cpusTmp.model.hasOwnProperty(k)) {
            cpus.model.push(cpusTmp.model[k]+' × '+k);
        }
    }
    for (k in cpusTmp.speed) {
        if (cpusTmp.speed.hasOwnProperty(k)) {
            cpus.speed.push(cpusTmp.speed[k]+' × '+k);
        }
    }
    cpus.model = cpus.model.join(', ');
    cpus.speed = cpus.speed.join(', ') + ' MHz';
    out.cpus = cpus;

    return format(out, order || ['uptime', 'loadavg', 'totalmem', 'freemem', 'cpus', 'hostname', 'type', 'platform', 'arch', 'release']);

};
