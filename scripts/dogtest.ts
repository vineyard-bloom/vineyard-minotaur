import { StatsD } from "hot-shots" 
var dogstatsd = new StatsD();

//Test Metrics
dogstatsd.increment('rpc.getrawtransaction')
dogstatsd.increment('rpc.getblockhash')
dogstatsd.increment('rpc.getblock')
dogstatsd.increment('rpc.getblockcount')
console.log('done')
//check in metrics explorer on datadog
