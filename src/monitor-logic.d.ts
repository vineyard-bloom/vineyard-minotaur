import { Profiler } from "./utility";
import { BlockQueueConfig, ExternalBlockQueue, IndexedBlock } from "./block-queue";
import { LastBlockDao } from "./types";
import { MonitorConfig } from "./ethereum-explorer";
import { blockchain } from "vineyard-blockchain";
import { Modeler } from "vineyard-data/legacy";
export declare enum ScannedBlockStatus {
    _new = 0,
    same = 1,
    replaced = 2,
}
export declare type BlockSaver<Block extends IndexedBlock> = (blocks: Block[]) => Promise<void>;
export interface IndexedHashedBlock extends IndexedBlock {
    hash: string;
}
export declare function createBlockQueue<Block extends IndexedBlock>(lastBlockDao: LastBlockDao, client: blockchain.BlockReader<Block>, queueConfig: BlockQueueConfig): Promise<ExternalBlockQueue<Block>>;
export interface BlockSource {
    getHighestBlockIndex(): Promise<number>;
    getBlock(index: number): Promise<blockchain.Block>;
}
export interface BlockComparison {
    hash: string;
    index: number;
    status: ScannedBlockStatus;
}
export declare function compareBlockHashes(ground: Modeler, blocks: IndexedHashedBlock[]): PromiseLike<BlockComparison[]>;
export declare function mapBlocks<Block extends IndexedHashedBlock>(fullBlocks: Block[]): (simple: IndexedBlock) => Block;
export declare function scanBlocks<Block extends IndexedHashedBlock>(blockQueue: ExternalBlockQueue<Block>, saveFullBlocks: BlockSaver<Block>, ground: Modeler, config: MonitorConfig, profiler?: Profiler): Promise<any>;
