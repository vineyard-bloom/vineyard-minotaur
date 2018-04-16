"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localConfig = {
    database: {
        host: "localhost",
        database: "vineyard_minotaur_btc_dev",
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
        "username": "",
        "password": "",
        "port": 8332,
    }
};
