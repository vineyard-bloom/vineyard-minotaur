import { Profiler } from "./utility";
import { BlockQueueConfig, ExternalBlockQueue, IndexedBlock } from "./block-queue";
import { LastBlockDao } from "./types";
import { MonitorConfig } from "./ethereum-explorer";
import { blockchain } from "vineyard-blockchain";
export declare type BlockSaver<Block extends IndexedBlock> = (blocks: Block[], minConfirmedBlockIndex: number) => Promise<void>;
export declare function createBlockQueue<Block extends IndexedBlock>(lastBlockDao: LastBlockDao, client: blockchain.BlockReader<Block>, queueConfig: BlockQueueConfig): Promise<ExternalBlockQueue<Block>>;
export declare function scanBlocks<Block extends IndexedBlock>(blockQueue: ExternalBlockQueue<Block>, saveFullBlocks: BlockSaver<Block>, config: MonitorConfig, profiler?: Profiler): Promise<any>;
