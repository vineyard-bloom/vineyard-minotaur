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
require('source-map-support').install();
const lab_1 = require("../lab");
const config_eth_1 = require("../config/config-eth");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const village = yield lab_1.createEthereumVillage(config_eth_1.ethereumConfig);
        console.log('Initialized village');
        yield lab_1.startEthereumMonitor(village, {
            queue: { maxSize: 10, minSize: 5 },
        });
    });
}
main();
//# sourceMappingURL=eth-scan.js.map