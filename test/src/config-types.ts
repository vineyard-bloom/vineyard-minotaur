import {GeneralDatabaseConfig} from "vineyard-ground"

export interface VillageDatabaseConfig extends GeneralDatabaseConfig {
  devMode?: boolean
}

export interface FullConfig {
  database: VillageDatabaseConfig,
  ethereum: {
    client: {
      http: string
    }
  }
}