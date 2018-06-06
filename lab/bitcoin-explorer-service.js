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
const schema_1 = require("../src/schema");
const bitcoin_model_1 = require("../src/bitcoin-explorer/bitcoin-model");
function startBitcoinMonitor(village, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const defaults = {
                minConfirmations: 7
            };
            const appliedConfig = Object.assign({}, defaults, config);
            const { model, client } = village;
            const dao = bitcoin_model_1.createBitcoinExplorerDao(model);
            console.log('Starting cron');
            yield src_1.scanBitcoinExplorerBlocks(dao, client, appliedConfig, profiler);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.startBitcoinMonitor = startBitcoinMonitor;
function createBitcoinVillage(config, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const minotaurVillage = yield village_1.createVillage(schema_1.getBitcoinExplorerSchema(), config);
        return Object.assign({}, minotaurVillage, { client });
    });
}
exports.createBitcoinVillage = createBitcoinVillage;
//# sourceMappingURL=bitcoin-explorer-service.js.map