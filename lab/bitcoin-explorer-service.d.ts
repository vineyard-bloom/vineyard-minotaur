import { MinotaurVillage } from "./village";
import { MonitorConfig, BitcoinModel } from "../src";
import { FullConfig } from "./config-types";
export declare type BitcoinVillage = MinotaurVillage<BitcoinModel>;
export declare function startBitcoinMonitor(village: BitcoinVillage, config: MonitorConfig): Promise<void>;
export declare function createBitcoinVillage(config: FullConfig): Promise<BitcoinVillage>;