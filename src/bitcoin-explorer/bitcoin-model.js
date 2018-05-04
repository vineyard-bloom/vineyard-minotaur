"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monitor_dao_1 = require("../monitor-dao");
const explorer_helpers_1 = require("../explorer-helpers");
function createBitcoinExplorerDao(model) {
    return {
        blockDao: {
            getBlockByIndex: (index) => model.Block.get(index).exec(),
            saveBlock: (block) => explorer_helpers_1.saveSingleCurrencyBlock(model.Block, block)
        },
        lastBlockDao: monitor_dao_1.createIndexedLastBlockDao(model.ground, 1),
        ground: model.ground
    };
}
exports.createBitcoinExplorerDao = createBitcoinExplorerDao;
//# sourceMappingURL=bitcoin-model.js.map