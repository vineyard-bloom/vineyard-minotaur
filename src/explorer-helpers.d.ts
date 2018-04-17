import { Collection } from "vineyard-data/legacy";
import { blockchain } from "vineyard-blockchain";
export declare function saveSingleCurrencyBlock(blockCollection: Collection<blockchain.Block>, block: blockchain.Block): Promise<void>;
export declare function getTransactionByTxid<Tx>(transactionCollection: Collection<Tx>, txid: string): Promise<Tx | undefined>;
