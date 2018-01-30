import { BlockInfo, ExternalSingleTransaction as ExternalTransaction, ReadClient, SingleTransaction as Transaction } from "vineyard-blockchain";
import { MonitorDao } from "./types";
export declare type TransactionDelegate = (transaction: Transaction) => Promise<Transaction>;
export declare type TransactionCheck = (transaction: ExternalTransaction) => Promise<boolean>;
export declare type TransactionSaver = (source: ExternalTransaction, block: BlockInfo) => Promise<Transaction | undefined>;
export declare function scanBlocksStandard(dao: MonitorDao, client: ReadClient<ExternalTransaction>, shouldTrackTransaction: TransactionCheck, onConfirm: TransactionDelegate, minimumConfirmations: number, currency: number): Promise<any>;
