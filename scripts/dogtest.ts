import { StatsD } from "hot-shots" 
var dogstatsd = new StatsD();

//Test Metrics
dogstatsd.increment('rpc.getrawtransaction', 0)
dogstatsd.increment('rpc.getblockhash', 0)
dogstatsd.increment('rpc.getblock', 0)
dogstatsd.increment('rpc.getblockcount')
console.log('done')
//check in metrics explorer on datadog
