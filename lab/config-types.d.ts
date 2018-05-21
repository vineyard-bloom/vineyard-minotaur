import { GeneralDatabaseConfig } from "vineyard-ground";
import { Network } from "bitcoinjs-lib";
import { BlockQueueConfig } from '../src/block-queue';
export interface VillageDatabaseConfig extends GeneralDatabaseConfig {
    devMode?: boolean;
}
export declare type CommonConfig = {
    database: VillageDatabaseConfig;
    interval: number;
};
export declare type BitcoinConfig = CommonConfig & {
    bitcoin: {
        host: string;
        username: string;
        password: string;
        port: number;
        network?: Network;
    };
    blockQueue: Partial<BlockQueueConfig>;
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
