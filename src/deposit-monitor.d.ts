import { ReadClient, Currency } from 'vineyard-blockchain';
import { SingleTransactionBlockchainModel } from './deposit-monitor-manager';
import { TransactionHandler } from "./types2";
import { LastBlock } from "./types";
export declare type ExternalTransaction = any;
export declare type Transaction = any;
export declare class DepositMonitor {
    private model;
    private client;
    private currency;
    private minimumConfirmations;
    private transactionHandler;
    constructor(model: SingleTransactionBlockchainModel, client: ReadClient<ExternalTransaction>, currency: Currency, minimumConfirmations: number, transactionHandler: TransactionHandler);
    private convertStatus(source);
    private saveExternalTransaction(source, block);
    private saveExternalTransactions(transactions, block);
    private confirmExistingTransaction(transaction);
    private updatePendingTransaction(transaction);
    scanBlocks(): Promise<void>;
    gatherTransactions(lastBlock: LastBlock | undefined): Promise<LastBlock | undefined>;
    updatePendingTransactions(maxBlockIndex: number): Promise<void>;
    update(): Promise<void>;
}
