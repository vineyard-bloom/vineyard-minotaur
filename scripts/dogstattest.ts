import { StatsD } from "hot-shots" 
var dogstatsd = new StatsD();

//Increment a counter.
dogstatsd.distribution('rpc.getblockcount', 0)
dogstatsd.increment('rpc.getblockcount')
console.log('done')
//check in metrics explorer on datadog

