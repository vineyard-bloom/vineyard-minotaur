import { AddressIdentityDelegate, LastBlock, MonitorDao, TransactionDao } from "./types";
import { Modeler } from "vineyard-ground/source/modeler";
import { Collection } from "vineyard-ground/source/collection";
import { blockchain } from "vineyard-blockchain";
import BigNumber from "bignumber.js";
export interface EthereumTransaction extends blockchain.BlockTransaction {
    to?: number;
    from?: number;
}
export interface Address {
    id: number;
    address: string;
    balance: BigNumber;
}
export interface EthereumModel {
    Address: Collection<Address>;
    Block: Collection<blockchain.Block>;
    Transaction: Collection<EthereumTransaction>;
    LastBlock: Collection<LastBlock>;
    ground: Modeler;
}
export declare function saveSingleCurrencyBlock(blockCollection: Collection<blockchain.Block>, block: blockchain.Block): Promise<void>;
export declare function getTransactionByTxid(transactionCollection: Collection<blockchain.SingleTransaction>, txid: string): Promise<blockchain.SingleTransaction | undefined>;
export declare function getOrCreateAddressReturningId(addressCollection: Collection<Address>, externalAddress: string): Promise<number>;
export declare function saveSingleCurrencyTransaction(transactionCollection: Collection<EthereumTransaction>, getOrCreateAddress: AddressIdentityDelegate<number>, transaction: blockchain.SingleTransaction): Promise<void>;
export declare function createSingleCurrencyTransactionDao(model: EthereumModel): TransactionDao;
export declare function createEthereumExplorerDao(model: EthereumModel): MonitorDao;
export declare type EthereumBlockClient = blockchain.BlockClient<blockchain.SingleTransaction>;
export declare function scanEthereumExplorerBlocksProfiled(dao: MonitorDao, client: EthereumBlockClient): Promise<any>;
export declare function scanEthereumExplorerBlocks(dao: MonitorDao, client: EthereumBlockClient): Promise<any>;
