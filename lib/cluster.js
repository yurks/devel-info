var collectProc = require('./collect/proc');

var initCluster = function(cluster) {
    if (!cluster || out.initialized) {
        return;
    }
    out.initialized = true;

    if (cluster.isMaster) {
        cluster.on('message', function(worker, message) {
            if (message === 'devel-info: get workers info') {
                var out = [collectProc.raw()];
                out[0]['#master'] = true;
                out[0]['#current'] = false;

                var total = 0;
                var id;

                for (id in cluster.workers) {
                    if (Object.prototype.hasOwnProperty.call(cluster.workers, id)) {
                        total++;
                        cluster.workers[id].send('devel-info: get process info');
                    }
                }

                var collectWorkersInfo = function(_worker, msg) {
                    if (msg && msg.key === 'devel-info: process info' && msg.data && msg.data.pid) {
                        msg.data['#current'] = !!(msg.data && msg.data.pid === worker.process.pid);
                        out.push(msg.data);
                    }
                    total--;
                    if (!total) {
                        out.sort(function (a, b) {
                            return a['#worker'] - b['#worker'];
                        });
                        worker.send({
                            key: 'devel-info: workers info',
                            data: out
                        });
                        cluster.removeListener('message', collectWorkersInfo);
                    }
                };

                if (total) {
                    cluster.on('message', collectWorkersInfo);
                }
            }
        });

    } else {
        process.on('message', function(msg) {
            if (msg === 'devel-info: get process info') {
                var proc = collectProc.raw();
                proc['#worker'] = cluster.worker.id;
                process.send({
                    key: 'devel-info: process info',
                    data: proc
                });
            }
        });
    }
};

var out = {
    initialized: false,
    initCluster: initCluster
};

module.exports = out;
