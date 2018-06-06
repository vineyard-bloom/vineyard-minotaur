import { BitcoinConfig, EthereumConfig } from "../lab/config-types"

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
      http: "http://"
    }
  },
  interval: 5000,
  profiling: true
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
    "host": "localhost",
    "username": "user",
    "password": "password",
    "port": 8332
  },
  blockQueue: {
    minSize: 5,
    maxSize: 10,
    maxBlockRequests: 10
  },
  interval: 15000,
  profiling: true
}