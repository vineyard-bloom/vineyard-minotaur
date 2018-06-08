import { BitcoinConfig, EthereumConfig } from "../../lab/config-types"
import { networks } from "bitcoinjs-lib"

export const ethereumConfig: EthereumConfig = {
  database: {
    host: "localhost",
    database: "vineyard_minotaur_dev",
    devMode: true,
    username: "",
    password: "",
    dialect: "postgres"
  },
  ethereum: {
    client: {
      http: ""
    }
  },
  interval: 15000,
  profiling: false
}

export const bitcoinConfig: BitcoinConfig = {
  database: {
    host: "localhost",
    database: "sql_vineyard_minotaur_btc_dev",
    devMode: true,
    username: "",
    password: "",
    dialect: "postgres"
  },
  bitcoin: {
    host: "localhost",
    username: "user",
    password: "password",
    port: 18332,
    network: networks.testnet
  },
  blockQueue: {
    maxBlockRequests: 5,
    maxSize: 8,
    minSize: 8
  },
  interval: 15000,
  profiling: false
}