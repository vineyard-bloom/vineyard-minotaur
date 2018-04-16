import { Modeler } from "vineyard-data/legacy";
import { FullConfig } from "../lab/config-types";
export declare function initialize(coin: 'Bitcoin' | 'Ethereum', config: FullConfig): Promise<void>;
export declare type SharedModel = {
    ground: Modeler;
    LastBlock: any;
    Currency: any;
};
