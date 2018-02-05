import { blockchain, BlockInfo, ExternalSingleTransaction as ExternalTransaction } from "vineyard-blockchain";
import { MonitorDao } from "./types";
export declare type TransactionDelegate = (transaction: blockchain.SingleTransaction) => Promise<blockchain.SingleTransaction>;
export declare type TransactionCheck = (transaction: ExternalTransaction) => Promise<boolean>;
export declare type TransactionSaver = (source: ExternalTransaction, block: BlockInfo) => Promise<blockchain.SingleTransaction | undefined>;
export declare function scanBlocksStandard(dao: MonitorDao, client: blockchain.ReadClient<blockchain.SingleTransaction>, shouldTrackTransaction: TransactionCheck, onConfirm: TransactionDelegate, minimumConfirmations: number, currency: number): Promise<any>;
