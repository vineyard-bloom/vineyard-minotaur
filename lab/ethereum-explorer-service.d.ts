import { MinotaurVillage } from "./village";
import { EthereumModel, MonitorConfig } from "../src";
import { FullConfig } from "./config-types";
export declare type EthereumVillage = MinotaurVillage<EthereumModel>;
export declare function startEthereumMonitor(village: EthereumVillage, config: MonitorConfig): Promise<void>;
export declare function createEthereumVillage(config: FullConfig): Promise<EthereumVillage>;
