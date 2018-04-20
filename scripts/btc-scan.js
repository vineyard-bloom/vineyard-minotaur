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
const bitcoin_explorer_service_1 = require("../lab/bitcoin-explorer-service");
const config_btc_1 = require("../config/config-btc");
const bitcoin_block_reader_1 = require("vineyard-bitcoin/src/bitcoin-block-reader");
require('source-map-support').install();
function initialize(model) {
    return __awaiter(this, void 0, void 0, function* () {
        yield model.ground.regenerate();
        yield model.Currency.create({ name: 'Bitcoin' });
        yield model.Currency.create({ name: 'Ethereum' });
        // await model.LastBlock.create({ currency: 2, blockIndex: 46401 })
        yield model.LastBlock.create({ currency: 2 });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const bitcoinConfig = config_btc_1.localConfig.bitcoin;
        const village = yield bitcoin_explorer_service_1.createBitcoinVillage(config_btc_1.localConfig, bitcoin_block_reader_1.BitcoinBlockReader.createFromConfig(bitcoinConfig));
        console.log('Initialized village');
        yield bitcoin_explorer_service_1.startBitcoinMonitor(village, {
            queue: { maxSize: 10, minSize: 5 },
        });
    });
}
main();
//# sourceMappingURL=btc-scan.js.map