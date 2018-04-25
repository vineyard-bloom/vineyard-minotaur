import { EthereumConfig } from "../lab/config-types"

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
  }
}