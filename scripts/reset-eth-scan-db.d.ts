import { Modeler } from "vineyard-data/legacy";
import { EthereumConfig } from "../lab/config-types";
export declare function resetEthScanDb(config: EthereumConfig): Promise<void>;
export declare type SharedModel = {
    ground: Modeler;
    LastBlock: any;
    Currency: any;
};
