"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
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
        "username": "user",
        "password": "password",
        "port": 18332,
        "network": bitcoinjs_lib_1.networks.testnet
    }
};
//# sourceMappingURL=config-btc.js.map