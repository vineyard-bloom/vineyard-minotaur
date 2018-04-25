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
const bitcoin_block_reader_1 = require("vineyard-bitcoin/src/bitcoin-block-reader");
const reset_btc_scan_db_1 = require("./reset-btc-scan-db");
require('source-map-support').install();
function main(resetDb) {
    return __awaiter(this, void 0, void 0, function* () {
        const bitcoinConfig = bitcoinConfig.bitcoin;
        const village = yield bitcoin_explorer_service_1.createBitcoinVillage(bitcoinConfig, bitcoin_block_reader_1.BitcoinBlockReader.createFromConfig(bitcoinConfig));
        console.log('Initialized village');
        if (resetDb && resetDb === '-r') {
            yield reset_btc_scan_db_1.resetBtcScanDb(village);
        }
        yield bitcoin_explorer_service_1.startBitcoinMonitor(village, {
            queue: { maxSize: 10, minSize: 5 },
        });
    });
}
main(process.argv[2]);
//# sourceMappingURL=btc-scan.js.map