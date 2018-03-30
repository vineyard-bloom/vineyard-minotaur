import { FullConfig } from "./config-types";
import {localConfig} from "../config/config"
import { SequelizeClient, DevModeler, Modeler } from "vineyard-ground"

export interface Village<Model> {
  config: FullConfig
  model: Model
}

// function loadSchema() {
//   return Object.assign(
//     {},
//     getEthereumExplorerSchema()
//   )
// }

function createModel<Model>(schema: any): Model {
  const databaseConfig = localConfig.database
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

export async function createVillage<Model>(schema: any): Promise<Village<Model>> {

  return {
    config: localConfig,
    model: createModel<Model>(schema)
  }
}