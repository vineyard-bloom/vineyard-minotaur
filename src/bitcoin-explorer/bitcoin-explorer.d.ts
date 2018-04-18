import { Profiler } from "../utility";
import { blockchain } from "vineyard-blockchain";
import { MonitorDao } from "../types";
import { Modeler } from "vineyard-data/legacy";
import { MonitorConfig } from "../ethereum-explorer";
export declare function scanBitcoinExplorerBlocks(dao: BitcoinMonitorDao, client: MultiTransactionBlockClient, config: MonitorConfig, profiler?: Profiler): Promise<any>;
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
export declare type MultiTransactionBlockClient = blockchain.BlockReader<blockchain.FullBlock<blockchain.MultiTransaction>>;
export interface BitcoinMonitorDao extends MonitorDao {
    ground: Modeler;
}
