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
const bitcoin_explorer_service_1 = require("../lab/bitcoin-explorer-service");
function initialize(coin, config) {
    return __awaiter(this, void 0, void 0, function* () {
        let dbModel;
        switch (coin) {
            case 'Bitcoin':
                const btcVillage = yield bitcoin_explorer_service_1.createBitcoinVillage(config);
                dbModel = btcVillage.model;
                break;
            case 'Ethereum':
                const ethVillage = yield ethereum_explorer_service_1.createEthereumVillage(config);
                dbModel = ethVillage.model;
                break;
            default:
                throw new Error('Invalid coin type, expected Bitcoin or Ethereum, got ' + coin);
        }
        dbModel.ground.regenerate();
        yield dbModel.LastBlock.create({ currency: 1 });
        yield dbModel.LastBlock.create({ currency: 2 });
        yield dbModel.Currency.create({ name: 'Bitcoin' });
        yield dbModel.Currency.create({ name: 'Ethereum' });
        process.exit(0);
    });
}
exports.initialize = initialize;
const coin = (process.argv[2] || 'Bitcoin');
const config = require(process.argv[3] || '../config/config').localConfig;
console.log(JSON.stringify(config));
initialize(coin, config);
//# sourceMappingURL=reset-db.js.map