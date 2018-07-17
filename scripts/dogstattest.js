"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hot_shots_1 = require("hot-shots");
var dogstatsd = new hot_shots_1.StatsD();
//Increment a counter.
dogstatsd.distribution('rpc.getblockcount', 0);
dogstatsd.increment('rpc.getblockcount');
console.log('done');
//# sourceMappingURL=dogstattest.js.map