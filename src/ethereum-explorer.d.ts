import { Address, LastBlock, MonitorDao, TransactionDao } from "./types";
import { blockchain } from "vineyard-blockchain";
import { Profiler } from "./utility";
import { Collection, Modeler } from 'vineyard-data/legacy';
export declare type SingleTransactionBlockClient = blockchain.BlockReader<blockchain.FullBlock<blockchain.ContractTransaction>>;
export interface EthereumTransaction extends blockchain.BlockTransaction {
    to?: number;
    from?: number;
    currency: string;
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
    Transaction: Collection<EthereumTransaction & {
        id: number;
    }>;
    LastBlock: Collection<LastBlock>;
    ground: Modeler;
}
export interface EthereumMonitorDao extends MonitorDao {
    getOrCreateAddress: AddressDelegate;
    ground: Modeler;
}
export declare function getOrCreateAddressReturningId(addressCollection: Collection<Address>, externalAddress: string): Promise<number>;
export declare function createSingleCurrencyTransactionDao(model: EthereumModel): TransactionDao<EthereumTransaction>;
export declare function createEthereumExplorerDao(model: EthereumModel): EthereumMonitorDao;
export interface MonitorConfig {
    queue: {
        maxSize: number;
        minSize: number;
    };
    maxMilliseconds?: number;
    maxBlocksPerScan?: number;
}
export declare function scanEthereumExplorerBlocks(dao: EthereumMonitorDao, client: SingleTransactionBlockClient, decodeTokenTransfer: blockchain.EventDecoder, config: MonitorConfig, profiler: Profiler | undefined, minConfirmations: number): Promise<any>;
