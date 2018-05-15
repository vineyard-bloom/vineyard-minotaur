import { MinotaurVillage } from "./village";
import { OptionalMonitorConfig } from "../src";
import { BitcoinConfig } from "./config-types";
import { BitcoinModel } from "../src/bitcoin-explorer/bitcoin-model";
import { MultiTransactionBlockClient } from "../src/bitcoin-explorer/bitcoin-explorer";
export declare type BitcoinVillage = MinotaurVillage<BitcoinModel, BitcoinConfig> & {
    client: MultiTransactionBlockClient;
};
export declare function startBitcoinMonitor(village: BitcoinVillage, config: OptionalMonitorConfig): Promise<void>;
export declare function createBitcoinVillage(config: BitcoinConfig, client: MultiTransactionBlockClient): Promise<BitcoinVillage>;
