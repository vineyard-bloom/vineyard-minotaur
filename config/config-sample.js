"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
exports.ethereumConfig = {
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
    interval: 15000
};
exports.bitcoinConfig = {
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
        "network": bitcoinjs_lib_1.networks.testnet
    },
    blockQueue: {
        minSize: 5,
        maxSize: 10,
        maxBlockRequests: 10
    },
    interval: 15000
};
//# sourceMappingURL=config-sample.js.map