'use strict';

const Linable = require('./lib/linable');

//在原来的基础上我再拓展4个功能型节点（可通过插件的方式来进行拓展）
Object.assign(Linable.preset.extends, {
    '*': {
        port: false,
        rounds: () => [[0, -1], [-1, 0], [0, 1], [1, 0]]
    },
    '/': {
        port: true,
        rounds: () => [[0, -1], [0, 1]]
    },
    ':': {
        port: false,
        rounds: () => [[0, -1], [1, 0]]
    },
    '"': {
        port: false,
        rounds: () => [[-1, 0], [0, 1]]
    }
});

// 编译包含新添加功能性节点的地图，找出所有合法的路径
const map = `
  /+   +-+  +--+/
   |   */|  |  |
   +--:"+"--*-:++
      +-++----X-+
`.match(/(^|\n).+/g).map(cur => cur.replace(/\n/, '').split(''));

const line = new Linable(
    map,
    nodes => map.some((row, i) =>
        row.some((val, j) =>
            nodes[val].port && (nodes = [i, j])
        )
    ) && nodes
);

console.log(
    Linable.find.call(line, 
        pat => pat.map(coor => 
            ({ coor: JSON.stringify(coor), value: map[coor[0]][coor[1]] })
        )
    )
);

