import { Transaction, ReadClient, Currency } from 'vineyard-blockchain';
import { BlockchainModel } from "./blockchain-model";
export declare class TransactionMonitor {
    private model;
    private client;
    private currency;
    private minimumConfirmations;
    constructor(model: BlockchainModel, client: ReadClient, currency: Currency, minimumConfirmations: number);
    private convertStatus(source);
    private saveExternalTransaction(source, block);
    private saveExternalTransactions(transactions, block);
    private confirmExistingTransaction(transaction);
    private updatePendingTransaction(transaction);
    gatherTransactions(currency: string): Promise<Transaction[]>;
    updatePendingTransactions(): Promise<any>;
    update(): Promise<any>;
}
