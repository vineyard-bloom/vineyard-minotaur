import { GeneralDatabaseConfig } from "../../vineyard-ground/source/index";
import { Network } from "bitcoinjs-lib";
export interface VillageDatabaseConfig extends GeneralDatabaseConfig {
    devMode?: boolean;
}
export declare type CommonConfig = {
    database: VillageDatabaseConfig;
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
