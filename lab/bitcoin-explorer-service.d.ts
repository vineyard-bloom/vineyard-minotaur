import { MinotaurVillage } from "./village";
import { MonitorConfig, BitcoinModel } from "../src/index";
export declare function startBitcoinMonitor(village: MinotaurVillage<BitcoinModel>, config: MonitorConfig): Promise<void>;
