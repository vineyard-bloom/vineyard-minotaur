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
const block_queue_1 = require("./block-queue");
const utility_1 = require("./utility");
const index_1 = require("./utility/index");
const database_functions_1 = require("./database-functions");
function gatherAddresses(blocks) {
    const addresses = {};
    for (let block of blocks) {
        for (let transaction of block.transactions) {
            for (let output of transaction.outputs) {
                addresses[output.address] = -1;
            }
        }
    }
    return addresses;
}
function saveTransactions(ground, transactions, addresses) {
    if (transactions.length == 0)
        return Promise.resolve();
    const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
    const transactionClauses = transactions.map(t => {
        // const to = t.to ? addresses[t.to] : 'NULL'
        // const from = t.from ? addresses[t.from] : 'NULL'
        return `(${t.status}, '${t.txid}', ${t.fee}, ${t.nonce}, 2, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`;
    });
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
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
                .then(() => saveTransactions(ground, transactions, addresses))
        ]);
        console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
    });
}
function scanBitcoinExplorerBlocks(dao, client, config, profiler = new utility_1.EmptyProfiler()) {
    return __awaiter(this, void 0, void 0, function* () {
        let blockIndex = yield database_functions_1.getNextBlock(dao.lastBlockDao);
        const blockQueue = new block_queue_1.ExternalBlockQueue(client, blockIndex, config.queue);
        const startTime = Date.now();
        do {
            const elapsed = Date.now() - startTime;
            // console.log('Scanning block', blockIndex, 'elapsed', elapsed)
            if (config.maxMilliseconds && elapsed > config.maxMilliseconds) {
                console.log('Reached timeout of ', elapsed, 'milliseconds');
                console.log('Canceled blocks', blockQueue.requests.map(b => b.blockIndex).join(', '));
                break;
            }
            profiler.start('getBlocks');
            const blocks = yield blockQueue.getBlocks();
            profiler.stop('getBlocks');
            if (blocks.length == 0) {
                console.log('No more blocks found.');
                break;
            }
            console.log('Saving blocks', blocks.map(b => b.index).join(', '));
            profiler.start('saveBlocks');
            yield saveFullBlocks(dao, blocks);
            profiler.stop('saveBlocks');
            // console.log('Saved blocks', blocks.map(b => b.index))
        } while (true);
    });
}
exports.scanBitcoinExplorerBlocks = scanBitcoinExplorerBlocks;
//# sourceMappingURL=bitcoin-explorer.js.map