"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const village_1 = require("./village");
const src_1 = require("../src");
const utility_1 = require("../src/utility");
const schema_1 = require("../src/schema");
const bitcoin_model_1 = require("../src/bitcoin-explorer/bitcoin-model");
async function startBitcoinMonitor(village, config) {
    try {
        const defaults = {
            minConfirmations: 7
        };
        const appliedConfig = Object.assign({}, defaults, config);
        const { model, client } = village;
        const dao = bitcoin_model_1.createBitcoinExplorerDao(model);
        console.log('Starting cron');
        const profiler = new utility_1.SimpleProfiler();
        await src_1.scanBitcoinExplorerBlocks(dao, client, appliedConfig, profiler);
        profiler.logFlat();
    }
    catch (error) {
        console.error(error);
    }
}
exports.startBitcoinMonitor = startBitcoinMonitor;
async function createBitcoinVillage(config, client) {
    const minotaurVillage = await village_1.createVillage(schema_1.getBitcoinExplorerSchema(), config);
    return Object.assign({}, minotaurVillage, { client });
}
exports.createBitcoinVillage = createBitcoinVillage;
//# sourceMappingURL=bitcoin-explorer-service.js.map