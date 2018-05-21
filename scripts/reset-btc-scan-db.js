"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin_explorer_service_1 = require("../lab/bitcoin-explorer-service");
const config_1 = require("../config/config");
const bitcoin_block_reader_1 = require("vineyard-bitcoin/src/bitcoin-block-reader");
async function resetBtcScanDb(village) {
    if (!village.config.database.devMode)
        throw new Error('Can only reset db in devMode.');
    const dbModel = village.model;
    await dbModel.ground.regenerate();
    await dbModel.Currency.create({ name: 'Bitcoin' });
    await dbModel.Currency.create({ name: 'Ethereum' });
    await dbModel.LastBlock.create({ currency: 1 });
    await dbModel.LastBlock.create({ currency: 2 });
}
exports.resetBtcScanDb = resetBtcScanDb;
if (require.main === module) {
    bitcoin_explorer_service_1.createBitcoinVillage(config_1.bitcoinConfig, bitcoin_block_reader_1.BitcoinBlockReader.createFromConfig(config_1.bitcoinConfig.bitcoin))
        .then(resetBtcScanDb)
        .then(() => process.exit(0));
}
//# sourceMappingURL=reset-btc-scan-db.js.map