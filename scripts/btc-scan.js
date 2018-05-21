"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin_explorer_service_1 = require("../lab/bitcoin-explorer-service");
const config_1 = require("../config/config");
const bitcoin_block_reader_1 = require("vineyard-bitcoin/src/bitcoin-block-reader");
const reset_btc_scan_db_1 = require("./reset-btc-scan-db");
const vineyard_cron_1 = require("vineyard-cron");
require('source-map-support').install();
async function main(resetDb) {
    const village = await bitcoin_explorer_service_1.createBitcoinVillage(config_1.bitcoinConfig, bitcoin_block_reader_1.BitcoinBlockReader.createFromConfig(config_1.bitcoinConfig.bitcoin));
    console.log('Initialized village');
    if (resetDb && resetDb === '-r') {
        await reset_btc_scan_db_1.resetBtcScanDb(village);
    }
    await bitcoin_explorer_service_1.startBitcoinMonitor(village, { queue: config_1.bitcoinConfig.blockQueue });
}
const bitcoinCron = new vineyard_cron_1.Cron([
    {
        name: 'Bitcoin Scanner',
        action: () => main(process.argv[2])
    }
], config_1.bitcoinConfig.interval);
bitcoinCron.start();
//# sourceMappingURL=btc-scan.js.map