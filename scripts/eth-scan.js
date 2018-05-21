"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const lab_1 = require("../lab");
const config_1 = require("../config/config");
const vineyard_cron_1 = require("vineyard-cron");
async function main() {
    const village = await lab_1.createEthereumVillage(config_1.ethereumConfig);
    console.log('Initialized village');
    await lab_1.startEthereumMonitor(village, {
        queue: { maxSize: 10, minSize: 5 }
    });
}
const ethereumCron = new vineyard_cron_1.Cron([
    {
        name: 'Ethereum Scanner',
        action: () => main()
    }
], config_1.ethereumConfig.interval);
ethereumCron.start();
//# sourceMappingURL=eth-scan.js.map