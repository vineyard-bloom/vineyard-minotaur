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
function resetBtcScanDb(village) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!village.config.database.devMode)
            throw new Error('Can only reset db in devMode.');
        const dbModel = village.model;
        yield dbModel.ground.regenerate();
        yield dbModel.Currency.create({ name: 'Bitcoin' });
        yield dbModel.Currency.create({ name: 'Ethereum' });
        yield dbModel.LastBlock.create({ currency: 1 });
        yield dbModel.LastBlock.create({ currency: 2 });
    });
}
exports.resetBtcScanDb = resetBtcScanDb;
if (require.main === module) {
    bitcoin_explorer_service_1.createBitcoinVillage(config_btc_1.bitcoinConfig, bitcoin_block_reader_1.BitcoinBlockReader.createFromConfig(config_btc_1.bitcoinConfig.bitcoin))
        .then(resetBtcScanDb)
        .then(() => process.exit(0));
}
//# sourceMappingURL=reset-btc-scan-db.js.map