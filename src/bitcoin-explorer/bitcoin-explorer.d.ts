import { Profiler } from "../utility";
import { blockchain } from "vineyard-blockchain";
import { MonitorConfig } from "../ethereum-explorer";
import { BitcoinMonitorDao } from "./bitcoin-model";
export declare type MultiTransactionBlockClient = blockchain.BlockReader<blockchain.Block, blockchain.MultiTransaction>;
export declare type BlockBundle = blockchain.BlockBundle<blockchain.Block, blockchain.MultiTransaction>;
export interface AssociatedInput {
    txid: string;
    index: number;
    input: blockchain.TransactionInput;
}
export interface AssociatedOutput {
    txid: string;
    index: number;
    output: blockchain.TransactionOutput;
}
export declare function scanBitcoinExplorerBlocks(dao: BitcoinMonitorDao, client: MultiTransactionBlockClient, config: MonitorConfig, profiler?: Profiler): Promise<any>;
