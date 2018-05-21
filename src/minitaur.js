"use strict";
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
async function saveFullBlocks(dao, blocks) {
    const ground = dao.ground;
    const transactions = index_1.flatMap(blocks, b => b.transactions);
    const addresses = gatherAddresses(blocks);
    const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index;
    await Promise.all([
        database_functions_1.saveBlocks(ground, blocks),
        dao.lastBlockDao.setLastBlock(lastBlockIndex),
        database_functions_1.getOrCreateAddresses(dao.ground, addresses)
            .then(() => database_functions_1.saveSingleTransactions(ground, transactions, addresses))
    ]);
    console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
}
async function scanMiniBlocks(dao, client, config, profiler = new utility_1.EmptyProfiler()) {
    const blockQueue = await monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue, config.minConfirmations);
    const saver = (blocks) => saveFullBlocks(dao, blocks);
    return monitor_logic_1.scanBlocks(blockQueue, saver, dao.ground, config, profiler);
}
exports.scanMiniBlocks = scanMiniBlocks;
//# sourceMappingURL=minitaur.js.map