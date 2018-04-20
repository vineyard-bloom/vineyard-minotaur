import { MinotaurVillage } from "./village";
import { MonitorConfig } from "../src";
import { FullConfig } from "./config-types";
import { BitcoinModel } from "../src/bitcoin-explorer/bitcoin-model";
import { MultiTransactionBlockClient } from "../src/bitcoin-explorer/bitcoin-explorer";
export declare type BitcoinVillage = MinotaurVillage<BitcoinModel> & {
    client: MultiTransactionBlockClient;
};
export declare function startBitcoinMonitor(village: BitcoinVillage, config: MonitorConfig): Promise<void>;
export declare function createBitcoinVillage(config: FullConfig, client: MultiTransactionBlockClient): Promise<BitcoinVillage>;
