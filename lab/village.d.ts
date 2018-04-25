import { CommonConfig } from "./config-types";
export interface MinotaurVillage<Model, Config> {
    config: Config;
    model: Model;
}
export declare function createVillage<Model, Config extends CommonConfig>(schema: any, config: Config): Promise<MinotaurVillage<Model, Config>>;
