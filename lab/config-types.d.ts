import { GeneralDatabaseConfig } from "vineyard-ground";
import { Network } from "bitcoinjs-lib";
import { BlockQueueConfig } from '../src/block-queue';
export interface VillageDatabaseConfig extends GeneralDatabaseConfig {
    devMode?: boolean;
}
export declare type CommonConfig = {
    database: VillageDatabaseConfig;
    interval: number;
    blockQueue: BlockQueueConfig;
    profiling?: boolean;
};
export declare type BitcoinConfig = CommonConfig & {
    bitcoin: {
        host: string;
        username: string;
        password: string;
        port: number;
        network?: Network;
    };
};
export declare type EthereumConfig = CommonConfig & {
    ethereum: {
        client: {
            http: string;
        };
    };
};
export interface FullConfig {
    database: VillageDatabaseConfig;
    ethereum: {
        client: {
            http: string;
        };
    };
    bitcoin: {
        host: string;
        username: string;
        password: string;
        port: number;
        network?: Network;
    };
}
