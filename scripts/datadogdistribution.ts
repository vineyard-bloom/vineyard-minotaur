import { StatsD } from "hot-shots" 
var dogstatsd = new StatsD();

//Distribute metrics
dogstatsd.distribution('rpc.getrawtransaction', 0)
dogstatsd.distribution('rpc.getblockhash', 0)
dogstatsd.distribution('rpc.getblock', 0)
// dogstatsd.distribution('rpc.getblockcount', 0)
// dogstatsd.increment('rpc.getblockcount')
console.log('done distributing metrics')
//check in metrics explorer on datadog

