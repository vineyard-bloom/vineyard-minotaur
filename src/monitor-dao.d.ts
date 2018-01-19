import { SingleTransaction as Transaction } from "vineyard-blockchain";
import { Model, TransactionToSave } from "./deposit-monitor-manager";
import { BaseBlock, BlockInfo, TransactionStatus } from "vineyard-blockchain/src/types";
export declare type TransactionQueryDelegate = (txid: string, currency: number) => Promise<Transaction | undefined>;
export declare type TransactionSaveDelegate = (transaction: TransactionToSave) => Promise<Transaction>;
export declare type TransactionStatusDelegate = (transaction: Transaction, status: TransactionStatus) => Promise<Transaction>;
export declare type PendingTransactionDelegate = (currency: number, maxBlockIndex: number) => Promise<Transaction[]>;
export declare type CurrencyDelegate = (currency: number) => Promise<BlockInfo | undefined>;
export declare type LastBlockDelegate = (block: string, currency: number) => Promise<BlockInfo | undefined>;
export declare type BlockCurrencyDelegate = (block: BaseBlock) => Promise<BlockInfo>;
export interface MonitorDao {
    getTransactionByTxid: TransactionQueryDelegate;
    saveTransaction: TransactionSaveDelegate;
    setStatus: TransactionStatusDelegate;
    listPendingTransactions: PendingTransactionDelegate;
    getLastBlock: CurrencyDelegate;
    setLastBlock: LastBlockDelegate;
    saveBlock: BlockCurrencyDelegate;
}
export declare function createMonitorDao(model: Model): MonitorDao;
