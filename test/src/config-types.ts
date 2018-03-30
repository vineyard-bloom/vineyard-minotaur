import { GeneralDatabaseConfig } from "vineyard-ground"

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
  bitcoin: {
    host: string
    user: string
    pass: string
    port: number
  }
}