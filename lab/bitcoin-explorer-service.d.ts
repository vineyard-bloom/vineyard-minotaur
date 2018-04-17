import { MinotaurVillage } from "./village";
import { MonitorConfig } from "../src";
import { FullConfig } from "./config-types";
import { BitcoinModel } from "../src/bitcoin-explorer/bitcoin-model";
export declare type BitcoinVillage = MinotaurVillage<BitcoinModel>;
export declare function startBitcoinMonitor(village: BitcoinVillage, config: MonitorConfig): Promise<void>;
export declare function createBitcoinVillage(config: FullConfig): Promise<BitcoinVillage>;
