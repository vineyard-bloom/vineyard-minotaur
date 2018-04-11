import { EthereumMonitorDao, MonitorConfig, SingleTransactionBlockClient } from "./ethereum-explorer";
import { Profiler } from "./utility";
export declare function scanMiniBlocks(dao: EthereumMonitorDao, client: SingleTransactionBlockClient, config: MonitorConfig, profiler?: Profiler): Promise<any>;
