import { BigNumber } from "bignumber.js";
import { Address, Currency, ID, LastBlock, MonitorDao } from "../types";
import { blockchain } from "vineyard-blockchain";
import { Collection, Modeler } from "vineyard-data/legacy";
export interface BitcoinMonitorDao extends MonitorDao {
    ground: Modeler;
}
export declare function createBitcoinExplorerDao(model: BitcoinModel): BitcoinMonitorDao;
export interface BitcoinModel {
    Address: Collection<Address>;
    Block: Collection<blockchain.Block>;
    Currency: Collection<Currency>;
    LastBlock: Collection<LastBlock>;
    Transaction: Collection<BitcoinTransaction>;
    TxIn: Collection<TxIn>;
    TxOut: Collection<TxOut>;
    ground: Modeler;
}
export interface BitcoinTransaction extends blockchain.BlockTransaction {
    currency: ID<Currency>;
    id: number;
}
export interface TxIn {
    transaction: ID<BitcoinTransaction>;
    index: number;
    sourceTransaction: ID<BitcoinTransaction> | undefined;
    sourceIndex: number | undefined;
    scriptSigHex: string | undefined;
    scriptSigAsm: string | undefined;
    sequence: number;
    coinbase: string | undefined;
}
export interface TxOut {
    transaction: ID<BitcoinTransaction>;
    index: number;
    scriptPubKeyHex: string;
    scriptPubKeyAsm: string;
    address: ID<Address>;
    amount: BigNumber;
}
