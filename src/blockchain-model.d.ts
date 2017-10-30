import { Address, BaseBlock, BaseTransaction, Block, Transaction, TransactionStatus } from "vineyard-blockchain";
import { Collection, Modeler } from "vineyard-ground";
export interface TransactionToSave extends BaseTransaction {
    status: TransactionStatus;
}
export declare type ConfirmationHandler = (transaction: Transaction) => Promise<Transaction>;
export declare const emptyConfirmationHandler: ConfirmationHandler;
export interface LastBlock {
    block: string;
    currency: string;
}
export interface Scan {
    block: string;
}
export interface Model {
    Address: Collection<Address>;
    Block: Collection<Block>;
    Transaction: Collection<Transaction>;
    LastBlock: Collection<LastBlock>;
    Scan: Collection<Scan>;
    ground: Modeler;
}
export declare class BlockchainModel {
    model: Model;
    confirmationHandler: ConfirmationHandler;
    constructor(model: Model, confirmationHandler?: ConfirmationHandler);
    getTransactionByTxid(txid: string, currency: string): Promise<Transaction | undefined>;
    saveTransaction(transaction: TransactionToSave): Promise<Transaction>;
    onConfirm(transaction: Transaction): Promise<Transaction>;
    setStatus(transaction: Transaction, status: TransactionStatus): Promise<Transaction>;
    listPending(currency: string): Promise<Transaction[]>;
    getLastBlock(currency: string): Promise<Block | undefined>;
    setLastBlock(block: string, currency: string): Promise<LastBlock>;
    setLastBlockByHash(hash: string, currency: string): Promise<LastBlock>;
    saveBlock(block: BaseBlock): Promise<Block>;
}
