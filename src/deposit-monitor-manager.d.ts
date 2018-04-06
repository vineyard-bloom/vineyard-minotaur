import { Collection } from 'vineyard-ground';
import { blockchain } from "vineyard-blockchain";
import { Address, BaseTransaction, Currency, LastBlock } from "./types";
export interface DepositMonitorManagerModel {
    Address: Collection<Address>;
    LastBlock: Collection<LastBlock>;
    Transaction: Collection<BaseTransaction>;
    ground: any;
}
export declare class DepositMonitorManager {
    model: DepositMonitorManagerModel;
    currency: Currency;
    constructor(model: DepositMonitorManagerModel, currency: Currency);
    getTransactionByTxid(txid: string): Promise<BaseTransaction | undefined>;
    saveTransaction(transaction: BaseTransaction): Promise<BaseTransaction>;
    setTransactionStatus(transaction: BaseTransaction, status: blockchain.TransactionStatus): Promise<BaseTransaction>;
    listPending(maxBlockIndex: number): Promise<BaseTransaction[]>;
    getLastBlock(): Promise<LastBlock | undefined>;
    setLastBlock(block: LastBlock): Promise<LastBlock>;
}
export declare type SingleTransactionBlockchainModel = DepositMonitorManager;
