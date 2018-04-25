import {FullConfig} from "../../lab"

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