import { LastBlock, LastBlockDao, MonitorDao, TransactionDao } from "./types";
import { Modeler } from "vineyard-ground/source/modeler";
import { Collection } from "vineyard-ground/source/collection";
import { blockchain } from "vineyard-blockchain";
import BigNumber from "bignumber.js";
import { Profiler } from "./profiler";
import { SingleTransactionBlockClient } from "./block-queue";
export interface EthereumTransaction extends blockchain.BlockTransaction {
    to?: number;
    from?: number;
}
export interface Address {
    id: number;
    address: string;
    balance: BigNumber;
}
export interface Currency {
    id: number;
    address?: number;
    name: string;
}
export declare type AddressDelegate = (externalAddress: string) => Promise<number>;
export interface TokenTransferRecord {
}
export interface EthereumModel {
    Address: Collection<Address>;
    Currency: Collection<any>;
    Contract: Collection<blockchain.Contract & {
        id: number;
    }>;
    Block: Collection<blockchain.Block>;
    Token: Collection<blockchain.TokenContract>;
    TokenTransfer: Collection<TokenTransferRecord>;
    Transaction: Collection<EthereumTransaction>;
    LastBlock: Collection<LastBlock>;
    ground: Modeler;
}
export interface EthereumMonitorDao extends MonitorDao {
    getOrCreateAddress: AddressDelegate;
    ground: Modeler;
}
export declare function saveSingleCurrencyBlock(blockCollection: Collection<blockchain.Block>, block: blockchain.Block): Promise<void>;
export declare function getTransactionByTxid<Tx>(transactionCollection: Collection<Tx>, txid: string): Promise<Tx | undefined>;
export declare function getOrCreateAddressReturningId(addressCollection: Collection<Address>, externalAddress: string): Promise<number>;
export declare function createSingleCurrencyTransactionDao(model: EthereumModel): TransactionDao<EthereumTransaction>;
export declare function createEthereumExplorerDao(model: EthereumModel): EthereumMonitorDao;
export interface MonitorConfig {
    maxConsecutiveBlocks?: number;
    maxMilliseconds?: number;
    maxBlocksPerScan?: number;
}
export declare function getNextBlock(lastBlockDao: LastBlockDao): Promise<number>;
export declare function scanEthereumExplorerBlocks(dao: EthereumMonitorDao, client: SingleTransactionBlockClient, config: MonitorConfig, profiler?: Profiler): Promise<any>;
