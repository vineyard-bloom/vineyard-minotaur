import { Collection } from 'vineyard-ground';
import { blockchain } from "vineyard-blockchain";
import { BaseTransaction, Currency, DepositTransaction, LastBlock } from "./types";
export interface DepositMonitorManagerModel {
    LastBlock: Collection<LastBlock>;
    Transaction: Collection<DepositTransaction>;
    ground: any;
}
export declare class DepositMonitorManager {
    model: DepositMonitorManagerModel;
    currency: Currency;
    constructor(model: DepositMonitorManagerModel, currency: Currency);
    getTransactionByTxid(txid: string): Promise<DepositTransaction | undefined>;
    saveTransaction(transaction: BaseTransaction): Promise<DepositTransaction>;
    setTransactionStatus(transaction: DepositTransaction, status: blockchain.TransactionStatus): Promise<DepositTransaction>;
    listPending(maxBlockIndex: number): Promise<DepositTransaction[]>;
    getLastBlock(): Promise<LastBlock | undefined>;
    setLastBlock(block: LastBlock): Promise<any>;
}
export declare type SingleTransactionBlockchainModel = DepositMonitorManager;
