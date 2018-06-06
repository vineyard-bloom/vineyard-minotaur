"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            http: "http://"
        }
    },
    interval: 5000,
    profiling: true
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
        "port": 8332
    },
    blockQueue: {
        minSize: 5,
        maxSize: 10,
        maxBlockRequests: 10
    },
    interval: 15000,
    profiling: true
};
//# sourceMappingURL=config-sample.js.map