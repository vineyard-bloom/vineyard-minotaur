import { FullConfig } from "./config-types";
export interface MinotaurVillage<Model> {
    config: FullConfig;
    model: Model;
}
export declare function createVillage<Model>(schema: any, config: FullConfig): Promise<MinotaurVillage<Model>>;
