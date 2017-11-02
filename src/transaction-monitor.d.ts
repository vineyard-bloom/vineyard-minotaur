import { ReadClient, Currency, BlockInfo } from 'vineyard-blockchain';
import { BlockchainModel } from "./blockchain-model";
import { TransactionHandler } from "./types";
export declare class TransactionMonitor {
    private model;
    private client;
    private currency;
    private minimumConfirmations;
    private transactionHandler;
    constructor(model: BlockchainModel, client: ReadClient, currency: Currency, minimumConfirmations: number, transactionHandler: TransactionHandler);
    private convertStatus(source);
    private saveExternalTransaction(source, block);
    private saveExternalTransactions(transactions, block);
    private confirmExistingTransaction(transaction);
    private updatePendingTransaction(transaction);
    scanBlocks(): Promise<void>;
    gatherTransactions(lastBlock: BlockInfo | undefined): Promise<BlockInfo | undefined>;
    updatePendingTransactions(): Promise<any>;
    update(): Promise<any>;
}
