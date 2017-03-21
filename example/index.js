var develInfo = require('..');

var cluster = require('cluster');
develInfo.initCluster(cluster);

if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;
    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    console.log('Now navigate to http://127.0.0.1:8011/devel-info');

} else {
    var http = require('http');

    var testCustomData = [
        1, [], [2], {}, {o:2}, 1, '', [2, {}, 2, {o:3}]
    ];
    testCustomData['#cols'] = 3;

    http.createServer(develInfo({
        custom: {
            'test data': {
                string: 'Some string',
                strings: ['Some', '', 'strings'],
                array: [],
                obj: {},
                number: 101,
                numbers: ['-1', '0x101', '1a1', NaN, Infinity, -Infinity, 0, -0, 'NaN', 'Infinity', '-Infinity', '0', '-0'],
                ips: ['192.168.0.1', '192.168.0.1:8080', '::ffff:192.168.0.1', '::1'],
                versions: ['1.0', 'v6.10.0', '1.0.2k', '^2.0.1', '3.0-alpha', 'v2.0.0-dev+20170309T161607Z'],
                null: [null, 'null'],
                undefined: [void 0, 'undefined'],
                bool: [true, false, 'True', 'FAlSE', 'Yes', 'NO'],
                mix1: {sub: {sub2: {a:1, b:2}}, b: void 0, c: 'string', d: [1,2,3, {sub: {a:1, b:2}}], e: {}},
                mix2: testCustomData
            }
        }
    })).listen(8011);
}