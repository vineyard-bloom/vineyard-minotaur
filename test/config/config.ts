import {FullConfig} from "../../lab"

export const localConfig: FullConfig = {
  database: {
    host: "localhost",
    database: "bitcoinminotaurdev",
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
  bitcoin: {
    "host": "localhost",
    "username": "user",
    "password": "password",
    "port": 18332,
  }
}