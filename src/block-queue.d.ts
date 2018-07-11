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
    private removeRequest;
    private removeBlocks;
    private onResponse;
    private addRequest;
    private getNextRequestCount;
    private update;
    private getConsecutiveBlocks;
    private addListener;
    private releaseBlocks;
    getBlocks(): Promise<Block[]>;
}
