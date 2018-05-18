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
const monitor_logic_1 = require("./monitor-logic");
const utility_1 = require("./utility");
const index_1 = require("./utility/index");
const database_functions_1 = require("./database-functions");
function gatherAddresses(blocks) {
    const addresses = {};
    for (let block of blocks) {
        for (let transaction of block.transactions) {
            if (transaction.to)
                addresses[transaction.to] = -1;
            if (transaction.from)
                addresses[transaction.from] = -1;
        }
    }
    return addresses;
}
function saveFullBlocks(dao, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        const ground = dao.ground;
        const transactions = index_1.flatMap(blocks, b => b.transactions);
        const addresses = gatherAddresses(blocks);
        const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index;
        yield Promise.all([
            database_functions_1.saveBlocks(ground, blocks),
            dao.lastBlockDao.setLastBlock(lastBlockIndex),
            database_functions_1.getOrCreateAddresses(dao.ground, addresses)
                .then(() => database_functions_1.saveSingleTransactions(ground, transactions, addresses))
        ]);
        console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
    });
}
function scanMiniBlocks(dao, client, config, profiler = new utility_1.EmptyProfiler()) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockQueue = yield monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue, config.minConfirmations, -1); // TODO: Set this to something that works
        const saver = (blocks) => saveFullBlocks(dao, blocks);
        return monitor_logic_1.scanBlocks(blockQueue, saver, dao.ground, dao.lastBlockDao, config, profiler);
    });
}
exports.scanMiniBlocks = scanMiniBlocks;
//# sourceMappingURL=minitaur.js.map