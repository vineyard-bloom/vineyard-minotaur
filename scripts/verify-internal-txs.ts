// How to call from commandline
// curl ec2-user@35.160.177.94:8545 -X POST --header 'Content-type: application/json' --data '{"jsonrpc":"2.0", "method":"debug_traceTransaction", "params":["0xa3b5c90f9c9094bdf0cec00f52d5ca46a0791331847e9721bb4c6eb1ec3eb471", {}], "id":1}'

//import { Web3EthereumClient } from "./ethereum-client";

import {Modeler, Schema} from "../../vineyard-ground"
//import {Modeler, Schema} from "vineyard-ground"
import * as Web3 from 'web3'
import { BitcoinBlockReader } from "../vineyard-blockchain/src/bitcoin-block-reader"


//import { EthereumBlockReader } from "./block-reader"

const web3 = new Web3()
web3.setProvider(new Web3.providers.HttpProvider("http://35.160.177.94:8545"))
console.log(web3.isConnected())
//const txs = web3.eth.getBlock(5641147).transactions
//console.log(web3.eth.getBlock(5641147).transactions)
web3.currentProvider.sendAsync({
    method: "debug_traceTransaction",
    params: ['0xa3b5c90f9c9094bdf0cec00f52d5ca46a0791331847e9721bb4c6eb1ec3eb471', {}],
    jsonrpc: "2.0",
    id: "1"
}, function (err, result) {
    console.log('ERR: ' + err)
    console.log(result)
});

/*export interface BitcoinReadClient<Transaction extends EthereumTransaction, T extends BaseTransaction> extends ReadClient<T> {
  getFullBitcoinBlock(block: BlockInfo): Promise<FullBlock<Transaction> | undefined>
}*/

/*const client = EthereumBlockReader.createFromConfig(ethereumConfig.client)

const schema = new Schema(require('..vineyard-blockchain/src/schema.json'))
//const client = new PostgresClient(config.database))

function verifyInternalTransactions(modeler : Modeler, blockNumber : number) {

}*/