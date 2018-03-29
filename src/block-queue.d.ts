import { blockchain } from "vineyard-blockchain";
export declare type FullBlock = blockchain.FullBlock<blockchain.ContractTransaction>;
export declare type SingleTransactionBlockClient = blockchain.BlockReader<blockchain.ContractTransaction>;
export interface BlockRequest {
    blockIndex: number;
    promise: any;
}
export interface BlockQueueConfig {
    maxSize: number;
    minSize: number;
}
export declare class ExternalBlockQueue {
    private blocks;
    private blockIndex;
    private highestBlockIndex;
    private client;
    private config;
    requests: BlockRequest[];
    private listeners;
    constructor(client: SingleTransactionBlockClient, blockIndex: number, config: BlockQueueConfig);
    getBlockIndex(): number;
    private removeRequest(blockIndex);
    private removeBlocks(blocks);
    private onResponse(blockIndex, block);
    private addRequest(index);
    private update();
    private getConsecutiveBlocks();
    getBlocks(): Promise<FullBlock[]>;
}
