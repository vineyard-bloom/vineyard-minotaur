import { CommonConfig, FullConfig, VillageDatabaseConfig } from "./config-types";
import { SequelizeClient, DevModeler, Modeler } from "vineyard-ground"

export interface MinotaurVillage<Model, Config> {
  config: Config
  model: Model
}

function createModel<Model>(schema: any, config: {database: VillageDatabaseConfig}): Model {
  const databaseConfig = config.database
  const client = new SequelizeClient(databaseConfig)

  const modeler = !databaseConfig.devMode
    ? new Modeler(schema, client)
    : new DevModeler(schema, client)

  const model = Object.assign({
    ground: modeler,
    db: modeler.getLegacyDatabaseInterface(),
  }, modeler.collections) as any
  return model
}

export async function createVillage<Model, Config extends CommonConfig>(schema: any, config: Config): Promise<MinotaurVillage<Model, Config>> {
  return {
    config: config,
    model: createModel<Model>(schema, config)
  }
}