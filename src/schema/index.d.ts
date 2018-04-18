export interface Trellis {
    primary_keys?: string[];
    properties: any;
}
export interface FullSchema {
    Transaction: Trellis;
}
export declare function getFullMinotaurSchema(): FullSchema;
export declare function getEthereumExplorerSchema(): FullSchema;
export declare function getBitcoinExplorerSchema(): FullSchema;
export declare type Diff<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export declare type Omit<T, K extends keyof T> = {
    [P in Diff<keyof T, K>]: T[P];
};
