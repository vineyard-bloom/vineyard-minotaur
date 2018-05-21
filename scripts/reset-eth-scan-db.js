"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereum_explorer_service_1 = require("../lab/ethereum-explorer-service");
const config_1 = require("../config/config");
async function resetEthScanDb(config) {
    if (!config.database.devMode)
        throw new Error('Can only reset db in devMode.');
    const dbModel = (await ethereum_explorer_service_1.createEthereumVillage(config)).model;
    dbModel.ground.regenerate();
    await dbModel.LastBlock.create({ currency: 1 });
    await dbModel.LastBlock.create({ currency: 2 });
    await dbModel.Currency.create({ name: 'Bitcoin' });
    await dbModel.Currency.create({ name: 'Ethereum' });
    process.exit(0);
}
exports.resetEthScanDb = resetEthScanDb;
resetEthScanDb(config_1.ethereumConfig);
//# sourceMappingURL=reset-eth-scan-db.js.map