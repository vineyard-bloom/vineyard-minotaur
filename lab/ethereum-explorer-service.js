"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const village_1 = require("./village");
const src_1 = require("../src");
const utility_1 = require("../src/utility");
const block_reader_1 = require("vineyard-ethereum/src/block-reader");
const client_functions_1 = require("vineyard-ethereum/src/client-functions");
async function startEthereumMonitor(village, config) {
    try {
        const defaults = {
            minConfirmations: 12
        };
        const appliedConfig = Object.assign({}, defaults, config);
        const model = village.model;
        const ethereumConfig = village.config.ethereum;
        const client = block_reader_1.EthereumBlockReader.createFromConfig(ethereumConfig.client);
        const dao = src_1.createEthereumExplorerDao(model);
        const transactionDao = src_1.createSingleCurrencyTransactionDao(model);
        console.log('Starting cron');
        const profiler = new utility_1.SimpleProfiler();
        await src_1.scanEthereumExplorerBlocks(dao, client, client_functions_1.decodeTokenTransfer, appliedConfig, profiler);
        profiler.logFlat();
    }
    catch (error) {
        console.error('Ethereum scanning error:', error);
    }
}
exports.startEthereumMonitor = startEthereumMonitor;
function createEthereumVillage(config) {
    return village_1.createVillage(src_1.getEthereumExplorerSchema(), config);
}
exports.createEthereumVillage = createEthereumVillage;
//# sourceMappingURL=ethereum-explorer-service.js.map