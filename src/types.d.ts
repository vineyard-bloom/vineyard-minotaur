import { BlockInfo, ExternalSingleTransaction as ExternalTransaction, SingleTransaction as Transaction, TransactionStatus } from "vineyard-blockchain";
import { BigNumber } from 'bignumber.js';
export interface TransactionHandler {
    shouldTrackTransaction(transaction: ExternalTransaction): Promise<boolean>;
    onConfirm(transaction: Transaction): Promise<Transaction>;
}
export interface BaseAddress<Identity> {
    id: Identity;
    externalAddress: string;
    balance: BigNumber;
}
export interface SingleTransaction<Identity, AddressIdentity, BlockIdentity> {
    id: Identity;
    txid: string;
    amount: BigNumber;
    to: AddressIdentity;
    from: AddressIdentity;
    block: BlockIdentity;
    timeReceived: Date;
    status: number;
}
export interface BaseBlock {
    hash: string;
    index: number;
    timeMined: Date;
}
export declare type TransactionQueryDelegate = (txid: string) => Promise<Transaction | undefined>;
export declare type TransactionSaveDelegate<Identity, AddressIdentity, BlockIdentity> = (transaction: Partial<SingleTransaction<Identity, AddressIdentity, BlockIdentity>>) => Promise<void>;
export declare type TransactionStatusDelegate = (transaction: Transaction, status: TransactionStatus) => Promise<Transaction>;
export declare type PendingTransactionDelegate = (maxBlockIndex: number) => Promise<Transaction[]>;
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
export interface TransactionDao<TransactionIdentity, AddressIdentity, BlockIdentity> {
    getTransactionByTxid: TransactionQueryDelegate;
    saveTransaction: TransactionSaveDelegate<TransactionIdentity, AddressIdentity, BlockIdentity>;
    setStatus: TransactionStatusDelegate;
    listPendingTransactions: PendingTransactionDelegate;
}
export interface MonitorDao<TransactionIdentity, AddressIdentity, BlockIdentity> {
    blockDao: BlockDao;
    lastBlockDao: LastBlockDao;
    transactionDao: TransactionDao<TransactionIdentity, AddressIdentity, BlockIdentity>;
}
