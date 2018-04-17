import { BigNumber } from "bignumber.js";
import { Address, Currency, ID, LastBlock } from "../types";
import { blockchain } from "vineyard-blockchain";
import { Collection, Modeler } from "vineyard-data/legacy";
import { BitcoinMonitorDao } from "./bitcoin-explorer";
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
    sourceTransaction: string | undefined;
    sourceIndex: number | undefined;
    scriptSigHex: string | undefined;
    scriptSigAsm: string | undefined;
    sequence: number;
    address: ID<Address>;
    amount: BigNumber | undefined;
    valueSat: BigNumber | undefined;
    coinbase: string | undefined;
}
export interface TxOut {
    transaction: ID<BitcoinTransaction>;
    index: number;
    scriptPubKeyHex: string;
    scriptPubKeyAsm: string;
    address: ID<Address>;
    amount: BigNumber;
    spentTxId: string | undefined;
    spentHeight: number | undefined;
    spentIndex: number | undefined;
}
