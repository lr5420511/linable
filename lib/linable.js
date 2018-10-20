'use strict';

const Linable = module.exports = function(map, callback) {
    const pre = Linable.preset;
    this.nodes = Object.assign({}, pre.naives, pre.extends);
    this.source = map;
    this.port = callback(this.nodes);
};

Linable.prototype = {
    constructor: Linable,
    getCount: function(vaild = true) {
        return this.source.reduce((res, row) =>
            row.reduce((res, val) => 
                this.nodes[val].rounds().length ?
                    (vaild ? res + 1 : res) :
                    (vaild ? res : res + 1)
            , res)
        , 0);
    },
    getCoors: function(path) {
        const cur = path[path.length - 1],
            prev = path[path.length - 2],
            vectors = this.nodes[this.source[cur[0]][cur[1]]]
                .rounds(prev ? 
                    JSON.stringify([cur[0] - prev[0], cur[1] - prev[1]]) : null
                ).filter(vector => {
                    const next = [cur[0] + vector[0], cur[1] + vector[1]];
                    if(!this.source[next[0]]) return;
                    const node = this.nodes[this.source[next[0]][next[1]]];
                    if(!node) return;
                    vector = vector.map(cur => -cur);
                    return node.rounds().some(cur =>
                        cur[0] === vector[0] && cur[1] === vector[1]
                    ) && path.every(cur => 
                        cur[0] !== next[0] || cur[1] !== next[1]
                    );
                });
        return vectors.map(vector => 
            [cur[0] + vector[0], cur[1] + vector[1]]
        );
    }
};

Linable.preset = {
    naives: {
        'X': {
            port: true,
            rounds: () => [[0, -1], [-1, 0], [0, 1], [1, 0]]
        },
        '-': {
            port: false,
            rounds: () => [[0, -1], [0, 1]]
        },
        '|': {
            port: false,
            rounds: () => [[-1, 0], [1, 0]]
        },
        ' ': {
            port: false,
            rounds: () => []
        }
    },
    extends: {
        '+': {
            port: false,
            rounds: code => {
                const row = [[0, -1], [0, 1]],
                    col = [[-1, 0], [1, 0]];
                if(!code) return row.concat(col);
                return /^\[-?1,0\]$/.test(code) ? row : col;
            }
        }
    }
};

Linable.find = function(callback = path => path) {
    let path, paths = [[this.port]], lines = [];
    while(path = paths.pop()) {
        const nexts = this.getCoors(path);
        if(!nexts.length) continue;
        const temps = [],
            ports = nexts.filter(coor => {
                const node = this.nodes[this.source[coor[0]][coor[1]]];
                node.port || (temps.push(coor));
                return node.port;
            });
        paths = temps.length ?
            temps.map(coor => [...path, coor]).concat(paths) : paths;
        lines = ports.length ?
            lines.concat(ports.map(cur => [...path, cur])) : lines;
    }
    return lines.map(line => callback(line));
};