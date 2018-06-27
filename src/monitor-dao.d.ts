import { SingleTransaction as Transaction } from 'vineyard-blockchain';
import { Collection, Modeler } from 'vineyard-data/legacy';
import { LastBlockDao } from './types';
import { blockchain } from "vineyard-blockchain/src/blockchain";
export declare function setStatus(transactionCollection: Collection<Transaction>, transaction: Transaction, status: blockchain.TransactionStatus): Promise<Transaction>;
export declare function getLastBlockIndex(ground: Modeler, currency: number): Promise<number | undefined>;
export declare function setLastBlockIndex(ground: Modeler, currency: number, block: number): Promise<any>;
export declare function createIndexedLastBlockDao(ground: Modeler, currency: number): LastBlockDao;
