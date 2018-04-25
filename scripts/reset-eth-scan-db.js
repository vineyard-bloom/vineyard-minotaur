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
const ethereum_explorer_service_1 = require("../lab/ethereum-explorer-service");
const config_eth_1 = require("../config/config-eth");
function resetEthScanDb(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.database.devMode)
            throw new Error('Can only reset db in devMode.');
        const dbModel = (yield ethereum_explorer_service_1.createEthereumVillage(config)).model;
        dbModel.ground.regenerate();
        yield dbModel.LastBlock.create({ currency: 1 });
        yield dbModel.LastBlock.create({ currency: 2 });
        yield dbModel.Currency.create({ name: 'Bitcoin' });
        yield dbModel.Currency.create({ name: 'Ethereum' });
        process.exit(0);
    });
}
exports.resetEthScanDb = resetEthScanDb;
resetEthScanDb(config_eth_1.ethereumConfig);
//# sourceMappingURL=reset-eth-scan-db.js.map