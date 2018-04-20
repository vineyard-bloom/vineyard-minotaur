import { Modeler } from "vineyard-data/legacy";
import { BitcoinVillage } from "../lab/bitcoin-explorer-service";
export declare function resetBtcScanDb(village: BitcoinVillage): Promise<void>;
export declare type SharedModel = {
    ground: Modeler;
    LastBlock: any;
    Currency: any;
};
