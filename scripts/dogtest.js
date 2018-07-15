"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hot_shots_1 = require("hot-shots");
var dogstatsd = new hot_shots_1.StatsD();
//Test Metrics
dogstatsd.increment('rpc.getrawtransaction', 0);
dogstatsd.increment('rpc.getblockhash', 0);
dogstatsd.increment('rpc.getblock', 0);
dogstatsd.increment('rpc.getblockcount');
console.log('done');
//check in metrics explorer on datadog
//# sourceMappingURL=dogtest.js.map