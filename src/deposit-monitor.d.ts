import { ExternalSingleTransaction as ExternalTransaction, ReadClient, Currency, BlockInfo } from 'vineyard-blockchain';
import { SingleTransactionBlockchainModel } from "./deposit-monitor-manager";
import { TransactionHandler } from "./types";
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
    gatherTransactions(lastBlock: BlockInfo | undefined): Promise<BlockInfo | undefined>;
    updatePendingTransactions(maxBlockIndex: number): Promise<any>;
    update(): Promise<any>;
}
