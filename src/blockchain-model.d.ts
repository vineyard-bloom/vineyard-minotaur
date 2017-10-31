import { Address, BaseBlock, BaseTransaction, BlockInfo, Transaction, TransactionStatus } from "vineyard-blockchain";
import { Collection, Modeler } from "vineyard-ground";
export interface TransactionToSave extends BaseTransaction {
    status: TransactionStatus;
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
export declare class BlockchainModel {
    model: Model;
    constructor(model: Model);
    getTransactionByTxid(txid: string, currency: string): Promise<Transaction | undefined>;
    saveTransaction(transaction: TransactionToSave): Promise<Transaction>;
    setStatus(transaction: Transaction, status: TransactionStatus): Promise<Transaction>;
    listPending(currency: string): Promise<Transaction[]>;
    getLastBlock(currency: string): Promise<BlockInfo | undefined>;
    setLastBlock(block: string, currency: string): Promise<LastBlock>;
    setLastBlockByHash(hash: string, currency: string): Promise<LastBlock>;
    saveBlock(block: BaseBlock): Promise<BlockInfo>;
}
