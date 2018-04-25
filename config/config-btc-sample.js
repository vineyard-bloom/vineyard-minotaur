"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
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
    }
};
//# sourceMappingURL=config-btc-sample.js.map