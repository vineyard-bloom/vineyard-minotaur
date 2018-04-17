import { Modeler } from "vineyard-data/legacy";
import { FullConfig } from "../lab/config-types";
export declare function resetBtcScanDb(config: FullConfig): Promise<void>;
export declare type SharedModel = {
    ground: Modeler;
    LastBlock: any;
    Currency: any;
};
