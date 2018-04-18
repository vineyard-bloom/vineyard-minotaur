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
const config_1 = require("../config/config");
const ethereum_explorer_service_1 = require("../lab/ethereum-explorer-service");
function initialize(model) {
    return __awaiter(this, void 0, void 0, function* () {
        let dbModel;
        if (!model) {
            const village = yield ethereum_explorer_service_1.createEthereumVillage(config_1.localConfig);
            dbModel = village.model;
        }
        else {
            dbModel = model;
        }
        yield dbModel.ground.regenerate();
        yield dbModel.Currency.create({ name: 'Bitcoin' });
        yield dbModel.Currency.create({ name: 'Ethereum' });
        yield dbModel.LastBlock.create({ currency: 2 });
        process.exit(0);
    });
}
exports.initialize = initialize;
initialize();
//# sourceMappingURL=reset-db.js.map