import { GeneralDatabaseConfig } from "vineyard-ground"
import { Network } from "bitcoinjs-lib"
import { BlockQueueConfig } from '../src/block-queue'

export interface VillageDatabaseConfig extends GeneralDatabaseConfig {
  devMode?: boolean
}

export type CommonConfig = {
  database: VillageDatabaseConfig,
  interval: number,
  profiling?: boolean
}

export type BitcoinConfig = CommonConfig & {
  bitcoin: {
    host: string
    username: string
    password: string
    port: number
    network?: Network
  }
  blockQueue: BlockQueueConfig
}

export type EthereumConfig = CommonConfig & {
  ethereum: {
    client: {
      http: string
    }
  }
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
    username: string
    password: string
    port: number
    network?: Network
  }
}