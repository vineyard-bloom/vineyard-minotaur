import { blockchain } from "vineyard-blockchain";
export interface BlockRequest {
    blockIndex: number;
    promise: any;
}
export interface BlockQueueConfig {
    maxSize: number;
    minSize: number;
}
export declare class ExternalBlockQueue<Transaction extends blockchain.BlockTransaction> {
    private blocks;
    private blockIndex;
    private highestBlockIndex;
    private client;
    private config;
    requests: BlockRequest[];
    private listeners;
    constructor(client: blockchain.BlockReader<Transaction>, blockIndex: number, config: BlockQueueConfig);
    getBlockIndex(): number;
    private removeRequest(blockIndex);
    private removeBlocks(blocks);
    private onResponse(blockIndex, block);
    private addRequest(index);
    private update();
    private getConsecutiveBlocks();
    getBlocks(): Promise<blockchain.FullBlock<Transaction>[]>;
}
