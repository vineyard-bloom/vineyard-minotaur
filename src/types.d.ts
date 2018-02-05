import { blockchain, BlockInfo, TransactionStatus } from "vineyard-blockchain";
import { BigNumber } from 'bignumber.js';
export interface TransactionHandler {
    shouldTrackTransaction(transaction: blockchain.SingleTransaction): Promise<boolean>;
    onConfirm(transaction: blockchain.SingleTransaction): Promise<blockchain.SingleTransaction>;
}
export interface BaseAddress<Identity> {
    id: Identity;
    externalAddress: string;
    balance: BigNumber;
}
export interface BaseBlock {
    hash: string;
    index: number;
    timeMined: Date;
}
export declare type TransactionQueryDelegate = (txid: string) => Promise<blockchain.SingleTransaction | undefined>;
export declare type TransactionSaveDelegate = (transaction: blockchain.SingleTransaction) => Promise<void>;
export declare type TransactionStatusDelegate = (transaction: blockchain.SingleTransaction, status: TransactionStatus) => Promise<blockchain.SingleTransaction>;
export declare type PendingTransactionDelegate = (maxBlockIndex: number) => Promise<blockchain.SingleTransaction[]>;
export declare type BlockGetter = () => Promise<BlockInfo | undefined>;
export declare type LastBlockDelegate = (block: string) => Promise<BlockInfo | undefined>;
export declare type BlockCurrencyDelegate = (block: BaseBlock) => Promise<BlockInfo>;
export declare type AddressIdentityDelegate<Identity> = (externalAddress: string) => Promise<Identity>;
export interface BlockDao {
    saveBlock: BlockCurrencyDelegate;
}
export interface LastBlockDao {
    getLastBlock: BlockGetter;
    setLastBlock: LastBlockDelegate;
}
export interface TransactionDao {
    getTransactionByTxid: TransactionQueryDelegate;
    saveTransaction: TransactionSaveDelegate;
    setStatus: TransactionStatusDelegate;
    listPendingTransactions: PendingTransactionDelegate;
}
export interface MonitorDao {
    blockDao: BlockDao;
    lastBlockDao: LastBlockDao;
    transactionDao: TransactionDao;
}
