import { networks } from "bitcoinjs-lib"
import { BitcoinConfig } from "../lab/config-types"

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
  }
}