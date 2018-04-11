import { blockchain } from 'vineyard-blockchain';
import { Modeler } from 'vineyard-data/legacy';
import { LastBlockDao } from "./types";
export declare type AddressMap = {
    [key: string]: number;
};
export declare function getOrCreateAddresses(ground: Modeler, addresses: AddressMap): Promise<void>;
export declare function addressesAreAssociated(addresses: AddressMap): boolean;
export declare function saveBlocks(ground: Modeler, blocks: blockchain.Block[]): Promise<any>;
export interface CurrencyResult {
    currency: any;
    tokenContract: blockchain.TokenContract;
}
export declare function saveCurrencies(ground: Modeler, tokenContracts: blockchain.Contract[]): Promise<CurrencyResult[]>;
export declare function getNextBlock(lastBlockDao: LastBlockDao): Promise<number>;
export declare function saveSingleTransactions(ground: any, transactions: blockchain.SingleTransaction[], addresses: AddressMap): any;
