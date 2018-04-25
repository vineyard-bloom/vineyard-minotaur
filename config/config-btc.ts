import {FullConfig} from "../lab"
import { networks } from "bitcoinjs-lib"

export const localConfig: FullConfig = {
  database: {
    host: "localhost",
    database: "sql_vineyard_minotaur_btc_dev",
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
  bitcoin: {
    "host": "localhost",
    "username": "user",
    "password": "password",
    "port": 18332,
    "network": networks.testnet
  }
}