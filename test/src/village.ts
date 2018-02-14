import { FullConfig } from "./config-types";
import { EthereumModel } from "../..";
import { getEthereumExplorerSchema } from "../.."
import {localConfig} from "../config/config"
import { SequelizeClient, DevModeler, Modeler } from "vineyard-ground"

export interface Village {
  config: FullConfig
  model: EthereumModel
}

function loadSchema() {
  return Object.assign(
    {},
    getEthereumExplorerSchema()
  )
}

function createModel(): EthereumModel {
  const schema = loadSchema()
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

export async function createVillage(): Promise<Village> {

  return {
    config: localConfig,
    model: createModel()
  }
}