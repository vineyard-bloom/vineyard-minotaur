import { blockchain, BlockInfo, TransactionStatus } from "vineyard-blockchain";
import { BigNumber } from 'bignumber.js';
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
export declare type TransactionDelegate = (transaction: blockchain.SingleTransaction) => Promise<blockchain.SingleTransaction>;
export declare type TransactionCheck = (transaction: blockchain.SingleTransaction) => Promise<boolean>;
export declare type TransactionSaver = (source: blockchain.SingleTransaction, block: BlockInfo) => Promise<blockchain.SingleTransaction | undefined>;
export declare type TransactionQueryDelegate = (txid: string) => Promise<blockchain.SingleTransaction | undefined>;
export declare type TransactionSaveDelegate = (transaction: blockchain.SingleTransaction) => Promise<void>;
export declare type TransactionStatusDelegate = (transaction: blockchain.SingleTransaction, status: TransactionStatus) => Promise<blockchain.SingleTransaction>;
export declare type PendingTransactionDelegate = (maxBlockIndex: number) => Promise<blockchain.SingleTransaction[]>;
export declare type BlockGetterOld = () => Promise<BlockInfo | undefined>;
export declare type BlockGetter = () => Promise<number | undefined>;
export declare type LastBlockDelegate = (blockIndex: number) => Promise<BlockInfo | undefined>;
export declare type BlockCurrencyDelegate = (block: BaseBlock) => Promise<void>;
export declare type AddressIdentityDelegate<Identity> = (externalAddress: string) => Promise<Identity>;
export interface BlockDao {
    saveBlock: BlockCurrencyDelegate;
}
export interface LastBlockDaoOld {
    getLastBlock: BlockGetterOld;
    setLastBlock: LastBlockDelegate;
}
export interface LastBlockDao {
    getLastBlock: BlockGetter;
    setLastBlock: LastBlockDelegate;
}
export interface TransactionDao {
    getTransactionByTxid: TransactionQueryDelegate;
    saveTransaction: TransactionSaveDelegate;
    setStatus: TransactionStatusDelegate;
}
export interface PendingTransactionDao {
    listPendingTransactions: PendingTransactionDelegate;
}
export interface MonitorDaoOld {
    blockDao: BlockDao;
    lastBlockDao: LastBlockDaoOld;
    transactionDao: TransactionDao;
}
export interface MonitorDao {
    blockDao: BlockDao;
    lastBlockDao: LastBlockDao;
    transactionDao: TransactionDao;
}
export interface LastBlock {
    index?: number;
    currency: string;
}
