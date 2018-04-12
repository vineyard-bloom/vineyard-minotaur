import {FullConfig} from "../lab"

export const localConfig: FullConfig = {
  database: {
    host: "localhost",
    database: "",
    devMode: true,
    username: "postgres",
    password: "dev",
    dialect: "postgres"
  },
  ethereum: {
    client: {
      http: "http://"
    }
  },
  bitcoin: {
    "host": "localhost",
    "username": "",
    "password": "",
    "port": 8332,
  }
}