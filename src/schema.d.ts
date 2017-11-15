export interface Trellis {
    primary_keys?: string[];
    properties: any;
}
export interface FullSchema {
    Transaction: Trellis;
}
export declare function getFullMinotaurSchema(): FullSchema;
