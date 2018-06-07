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
      http: "http://35.160.177.94:8545"
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
    "host": "localhost",
    "username": "user",
    "password": "password",
    "port": 18332,
    "network": networks.testnet
  },
  blockQueue: {
    maxBlockRequests: 5,
    minSize: 5,
    maxSize: 10
  },
  interval: 15000,
  profiling: false
}