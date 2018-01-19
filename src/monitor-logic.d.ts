import { BlockInfo, ExternalSingleTransaction as ExternalTransaction, SingleTransaction as Transaction } from "vineyard-blockchain/src/types";
export declare type TransactionDelegate = (transaction: Transaction) => Promise<Transaction>;
export declare type TransactionCheck = (transaction: ExternalTransaction) => Promise<boolean>;
export declare type TransactionSaver = (source: ExternalTransaction, block: BlockInfo) => Promise<Transaction | undefined>;
