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
const index_1 = require("../src/index");
const index_2 = require("../src/utility/index");
const index_3 = require("../../vineyard-bitcoin/src/index");
function startBitcoinMonitor(village, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const model = village.model;
            const bitcoinConfig = village.config.bitcoin;
            const client = index_3.BitcoinBlockReader.createFromConfig(bitcoinConfig);
            const dao = index_1.createEthereumExplorerDao(model);
            console.log('Starting cron');
            const profiler = new index_2.SimpleProfiler();
            yield index_1.scanBitcoinExplorerBlocks(dao, client, config, profiler);
            profiler.logFlat();
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.startBitcoinMonitor = startBitcoinMonitor;
//# sourceMappingURL=bitcoin-explorer-service.js.map