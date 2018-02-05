import { blockchain, BlockInfo } from "vineyard-blockchain";
import { MonitorDao } from "./types";
export declare type TransactionDelegate = (transaction: blockchain.SingleTransaction) => Promise<void>;
export declare type TransactionCheck = (transaction: blockchain.SingleTransaction) => Promise<boolean>;
export declare type TransactionSaver = (source: blockchain.SingleTransaction, block: BlockInfo) => Promise<blockchain.SingleTransaction | undefined>;
export declare function scanBlock(dao: MonitorDao, client: blockchain.ReadClient<blockchain.SingleTransaction>): Promise<void>;
export declare function scanExplorerBlocks(dao: MonitorDao, client: blockchain.ReadClient<blockchain.SingleTransaction>): Promise<any>;
