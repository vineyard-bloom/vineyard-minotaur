import { Address, BaseBlock, BlockInfo, NewSingleTransaction, SingleTransaction as Transaction, TransactionStatus } from "vineyard-blockchain";
import { Collection, Modeler } from "vineyard-ground";
export interface TransactionToSave extends NewSingleTransaction {
    status: TransactionStatus;
    currency: string;
}
export interface LastBlock {
    block: string;
    currency: string;
}
export interface Scan {
    block: string;
}
export interface Model {
    Address: Collection<Address>;
    Block: Collection<BlockInfo>;
    Transaction: Collection<Transaction>;
    LastBlock: Collection<LastBlock>;
    Scan: Collection<Scan>;
    ground: Modeler;
}
export declare class DepositMonitorManager {
    model: Model;
    constructor(model: Model);
    getTransactionByTxid(txid: string, currency: string): Promise<Transaction | undefined>;
    saveTransaction(transaction: TransactionToSave): Promise<Transaction>;
    setStatus(transaction: Transaction, status: TransactionStatus): Promise<Transaction>;
    listPending(currency: string, maxBlockIndex: number): Promise<Transaction[]>;
    getLastBlock(currency: string): Promise<BlockInfo | undefined>;
    setLastBlock(block: string, currency: string): Promise<LastBlock | undefined>;
    setLastBlockByHash(hash: string, currency: string): Promise<LastBlock>;
    saveBlock(block: BaseBlock): Promise<BlockInfo>;
    saveLastBlock(block: BaseBlock, currency: string): Promise<LastBlock>;
}
export declare type SingleTransactionBlockchainManager = DepositMonitorManager;
export declare type SingleTransactionBlockchainModel = DepositMonitorManager;
