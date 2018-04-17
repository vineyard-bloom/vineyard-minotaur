"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const village_1 = require("./village");
const src_1 = require("../src");
const utility_1 = require("../src/utility");
const block_reader_1 = require("vineyard-ethereum/src/block-reader");
const client_functions_1 = require("vineyard-ethereum/src/client-functions");
function startEthereumMonitor(village, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const model = village.model;
            const ethereumConfig = village.config.ethereum;
            const client = block_reader_1.EthereumBlockReader.createFromConfig(ethereumConfig.client);
            const dao = src_1.createEthereumExplorerDao(model);
            const transactionDao = src_1.createSingleCurrencyTransactionDao(model);
            console.log('Starting cron');
            const profiler = new utility_1.SimpleProfiler();
            yield src_1.scanEthereumExplorerBlocks(dao, client, client_functions_1.decodeTokenTransfer, config, profiler);
            profiler.logFlat();
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.startEthereumMonitor = startEthereumMonitor;
function createEthereumVillage(config) {
    return village_1.createVillage(src_1.getEthereumExplorerSchema(), config);
}
exports.createEthereumVillage = createEthereumVillage;
//# sourceMappingURL=ethereum-explorer-service.js.map