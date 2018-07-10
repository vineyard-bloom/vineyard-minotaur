export interface BlockRequest {
    blockIndex: number;
    promise: any;
}
export interface BlockQueueConfig {
    maxSize: number;
    maxBlockRequests: number;
    minSize: number;
}
export declare type BlockSource<T> = (index: number) => Promise<T>;
export declare class BlockQueue<Block> {
    private blocks;
    private blockIndex;
    private highestBlockIndex;
    private blockSource;
    private config;
    requests: BlockRequest[];
    private listeners;
    constructor(blockSource: BlockSource<Block>, blockIndex: number, highestBlockIndex: number, config: Partial<BlockQueueConfig>);
    getBlockIndex(): number;
    private removeRequest(blockIndex);
    private removeBlocks(blocks);
    private onResponse(blockIndex, block);
    private addRequest(index);
    private getNextRequestCount();
    private update(requestCount);
    private getConsecutiveBlocks();
    private addListener();
    private releaseBlocks(blocks);
    getBlocks(): Promise<Block[]>;
}
