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
function resetBtcScanDb(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.database.devMode)
            throw new Error('Can only reset db in devMode.');
        const bitcoinConfig = config.bitcoin;
        const dbModel = (yield bitcoin_explorer_service_1.createBitcoinVillage(config_btc_1.localConfig, bitcoin_block_reader_1.BitcoinBlockReader.createFromConfig(bitcoinConfig))).model;
        yield dbModel.ground.regenerate();
        yield dbModel.Currency.create({ name: 'Bitcoin' });
        yield dbModel.Currency.create({ name: 'Ethereum' });
        yield dbModel.LastBlock.create({ currency: 1 });
        yield dbModel.LastBlock.create({ currency: 2 });
    });
}
exports.resetBtcScanDb = resetBtcScanDb;
resetBtcScanDb(config_btc_1.localConfig).then(() => process.exit(0));
//# sourceMappingURL=reset-btc-scan-db.js.map