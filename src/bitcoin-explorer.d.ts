import { Profiler } from "./utility";
import { blockchain } from "vineyard-blockchain";
import { MonitorDao } from "./types";
import { Modeler } from "vineyard-data/legacy";
import { MonitorConfig } from "./ethereum-explorer";
export declare type MultiTransactionBlockClient = blockchain.BlockReader<blockchain.MultiTransaction>;
export interface BitcoinMonitorDao extends MonitorDao {
    ground: Modeler;
}
export declare function scanBitcoinExplorerBlocks(dao: BitcoinMonitorDao, client: MultiTransactionBlockClient, config: MonitorConfig, profiler?: Profiler): Promise<any>;
