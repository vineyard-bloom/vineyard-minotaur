import { Address, BaseBlock, BlockInfo, NewSingleTransaction, SingleTransaction as Transaction, TransactionStatus } from "vineyard-blockchain";
import { Collection, Modeler } from "vineyard-ground";
export interface TransactionToSave extends NewSingleTransaction {
    status: TransactionStatus;
    currency: number;
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
export declare class SingleTransactionBlockchainModel {
    model: Model;
    constructor(model: Model);
    getTransactionByTxid(txid: string, currency: number): Promise<Transaction | undefined>;
    saveTransaction(transaction: TransactionToSave): Promise<Transaction>;
    setStatus(transaction: Transaction, status: TransactionStatus): Promise<Transaction>;
    listPending(currency: number, maxBlockIndex: number): Promise<Transaction[]>;
    getLastBlock(currency: number): Promise<BlockInfo | undefined>;
    setLastBlock(block: string, currency: number): Promise<LastBlock | undefined>;
    setLastBlockByHash(hash: string, currency: number): Promise<LastBlock>;
    saveBlock(block: BaseBlock): Promise<BlockInfo>;
    saveLastBlock(block: BaseBlock, currency: number): Promise<LastBlock>;
}
