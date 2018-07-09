import { Profiler } from "./utility";
import { BlockQueue, BlockQueueConfig, IndexedBlock } from "./block-queue";
import { LastBlockDao } from "./types";
import { MonitorConfig } from "./ethereum-explorer";
import { blockchain } from "vineyard-blockchain";
import { Modeler } from "vineyard-data/legacy";
export declare enum ScannedBlockStatus {
    _new = 0,
    same = 1,
    replaced = 2,
}
export declare type BlockSaver<Block, Transaction> = (bundles: blockchain.BlockBundle<Block, Transaction>[]) => Promise<void>;
export interface IndexedHashedBlock extends IndexedBlock {
    hash: string;
}
export declare function createBlockQueue<Block, Transaction>(lastBlockDao: LastBlockDao, client: blockchain.BlockReader<Block, Transaction>, queueConfig: Partial<BlockQueueConfig>, minConfirmations: number, startingBlockIndex: number): Promise<BlockQueue<blockchain.BlockBundle<Block, Transaction>>>;
export interface BlockSource {
    getHighestBlockIndex(): Promise<number>;
    getBlock(index: number): Promise<blockchain.Block>;
}
export declare function compareBlockHashes<T extends IndexedHashedBlock>(ground: Modeler, blocks: T[]): PromiseLike<(IndexedHashedBlock & {
    status: ScannedBlockStatus;
})[]>;
export declare function mapBlocks<Block extends IndexedHashedBlock, Transaction>(fullBlocks: blockchain.BlockBundle<Block, Transaction>[]): (s: IndexedBlock) => blockchain.BlockBundle<Block, Transaction>;
export declare function scanBlocks<Block extends IndexedHashedBlock, Transaction>(blockQueue: BlockQueue<blockchain.BlockBundle<Block, Transaction>>, saveFullBlocks: BlockSaver<Block, Transaction>, ground: Modeler, lastBlockDao: LastBlockDao, config: MonitorConfig, profiler: Profiler): Promise<any>;
