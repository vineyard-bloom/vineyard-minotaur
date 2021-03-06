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
const config_1 = require("../config/config");
const bitcoin_block_reader_1 = require("vineyard-bitcoin/src/bitcoin-block-reader");
const reset_btc_scan_db_1 = require("./reset-btc-scan-db");
const vineyard_cron_1 = require("vineyard-cron");
require('source-map-support').install();
function main(resetDb) {
    return __awaiter(this, void 0, void 0, function* () {
        const village = yield bitcoin_explorer_service_1.createBitcoinVillage(config_1.bitcoinConfig, bitcoin_block_reader_1.BitcoinBlockReader.createFromConfig(config_1.bitcoinConfig.bitcoin));
        console.log('Initialized village');
        if (resetDb && resetDb === '-r') {
            yield reset_btc_scan_db_1.resetBtcScanDb(village);
        }
        yield bitcoin_explorer_service_1.startBitcoinMonitor(village, {
            queue: config_1.bitcoinConfig.blockQueue,
            profiling: config_1.bitcoinConfig.profiling ? true : false
        });
    });
}
const bitcoinCron = new vineyard_cron_1.Cron([
    {
        name: 'Bitcoin Scanner',
        action: () => main(process.argv[2])
    }
], config_1.bitcoinConfig.interval);
bitcoinCron.start();
//# sourceMappingURL=btc-scan.js.map