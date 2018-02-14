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
const monitor_dao_1 = require("./monitor-dao");
const profiler_1 = require("./profiler");
const block_queue_1 = require("./block-queue");
function saveSingleCurrencyBlock(blockCollection, block) {
    return __awaiter(this, void 0, void 0, function* () {
        const existing = yield blockCollection.first({ index: block.index });
        if (existing)
            return;
        yield blockCollection.create(block);
    });
}
exports.saveSingleCurrencyBlock = saveSingleCurrencyBlock;
function getTransactionByTxid(transactionCollection, txid) {
    return transactionCollection.first({ txid: txid }).exec();
}
exports.getTransactionByTxid = getTransactionByTxid;
function getOrCreateAddressReturningId(addressCollection, externalAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const internalAddress = yield addressCollection.first({ address: externalAddress });
        return internalAddress
            ? internalAddress.id
            : (yield addressCollection.create({ address: externalAddress })).id;
    });
}
exports.getOrCreateAddressReturningId = getOrCreateAddressReturningId;
function createSingleCurrencyTransactionDao(model) {
    return {
        getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
        saveTransaction: (transaction) => __awaiter(this, void 0, void 0, function* () {
            yield model.Transaction.create(transaction);
        }),
        setStatus: monitor_dao_1.setStatus.bind(null, model.Transaction)
    };
}
exports.createSingleCurrencyTransactionDao = createSingleCurrencyTransactionDao;
function createEthereumExplorerDao(model) {
    return {
        blockDao: {
            saveBlock: (block) => saveSingleCurrencyBlock(model.Block, block)
        },
        lastBlockDao: monitor_dao_1.createIndexedLastBlockDao(model.ground, 2),
        // transactionDao: createSingleCurrencyTransactionDao(model),
        getOrCreateAddress: (externalAddress) => getOrCreateAddressReturningId(model.Address, externalAddress),
        ground: model.ground
    };
}
exports.createEthereumExplorerDao = createEthereumExplorerDao;
function getNextBlock(lastBlockDao) {
    return __awaiter(this, void 0, void 0, function* () {
        const lastBlockIndex = yield lastBlockDao.getLastBlock();
        return typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0;
    });
}
exports.getNextBlock = getNextBlock;
function gatherAddresses(blocks, contracts) {
    const addresses = {};
    for (let block of blocks) {
        for (let transaction of block.transactions) {
            if (transaction.to)
                addresses[transaction.to] = -1;
            if (transaction.from)
                addresses[transaction.from] = -1;
        }
    }
    for (let contract of contracts) {
        addresses[contract.address] = -1;
    }
    return addresses;
}
function setAddress(getOrCreateAddress, addresses, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getOrCreateAddress(key);
        addresses[key] = id;
    });
}
function saveTransactions(ground, blocks, addresses) {
    let transactionClauses = [];
    for (let block of blocks) {
        transactionClauses = transactionClauses.concat(block.transactions.map(t => {
            const to = t.to ? addresses[t.to] : 'NULL';
            const from = t.from ? addresses[t.from] : 'NULL';
            return `(${t.status}, '${t.txid}', ${to}, ${from}, ${t.amount}, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`;
        }));
    }
    if (transactionClauses.length == 0)
        return Promise.resolve();
    const header = 'INSERT INTO "transactions" ("status", "txid", "to", "from", "amount", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
}
function getOrCreateAddresses(ground, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        {
            const addressClauses = [];
            for (let i in addresses) {
                addressClauses.push(`'${i}'`);
            }
            if (addressClauses.length == 0)
                return Promise.resolve();
            const header = `SELECT "id", "address" FROM addresses
  WHERE "address" IN (
  `;
            const sql = header + addressClauses.join(',\n') + ');';
            const rows = yield ground.query(sql);
            for (let row of rows) {
                addresses[row.address] = parseInt(row.id);
            }
        }
        {
            const inserts = [];
            for (let i in addresses) {
                const value = addresses[i];
                if (value === -1) {
                    inserts.push(`('${i}', NOW(), NOW())`);
                }
            }
            if (inserts.length == 0)
                return Promise.resolve();
            const insertHeader = 'INSERT INTO "addresses" ("address", "created", "modified") VALUES\n';
            const sql = insertHeader + inserts.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";';
            const rows = yield ground.query(sql);
            for (let row of rows) {
                addresses[row.address] = parseInt(row.id);
            }
        }
    });
}
function saveBlocks(ground, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        const header = 'INSERT INTO "blocks" ("index", "hash", "timeMined", "created", "modified") VALUES\n';
        let inserts = [];
        for (let block of blocks) {
            inserts.push(`(${block.index}, '${block.hash}', '${block.timeMined.toISOString()}', NOW(), NOW())`);
        }
        const sql = header + inserts.join(',\n') + ' ON CONFLICT DO NOTHING;';
        return ground.querySingle(sql);
    });
}
function saveContracts(ground, contracts, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        if (contracts.length == 0)
            return Promise.resolve([]);
        let contractClauses = contracts.map(contract => {
            return `(${addresses[contract.address]}, '${contract.name}', NOW(), NOW())`;
        });
        const header = 'INSERT INTO "currencies" ("address", "name", "created", "modified") VALUES\n';
        const sql = header + contractClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
        return ground.querySingle(sql);
    });
}
function gatherNewContracts(blocks) {
    let result = [];
    for (let block of blocks) {
        result = result.concat(block.transactions
            .filter(t => t.newContract)
            .map(t => t.newContract));
    }
    return result;
}
function saveFullBlocks(dao, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        const contracts = gatherNewContracts(blocks);
        const addresses = gatherAddresses(blocks, contracts);
        const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index;
        yield Promise.all([
            saveBlocks(dao.ground, blocks),
            dao.lastBlockDao.setLastBlock(lastBlockIndex),
            getOrCreateAddresses(dao.ground, addresses)
                .then(() => saveContracts(dao.ground, contracts, addresses))
                .then(() => saveTransactions(dao.ground, blocks, addresses))
        ]);
        console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
    });
}
function scanEthereumExplorerBlocks(dao, client, config, profiler = new profiler_1.EmptyProfiler()) {
    return __awaiter(this, void 0, void 0, function* () {
        let blockIndex = yield getNextBlock(dao.lastBlockDao);
        const blockQueue = new block_queue_1.ExternalBlockQueue(client, blockIndex, config.maxConsecutiveBlocks);
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
            if (blocks.length == 0)
                break;
            console.log('Saving blocks', blocks.map(b => b.index).join(', '));
            profiler.start('saveBlocks');
            yield saveFullBlocks(dao, blocks);
            profiler.stop('saveBlocks');
            // console.log('Saved blocks', blocks.map(b => b.index))
        } while (true);
        // blockQueue.p.logFlat()
        profiler.logFlat();
    });
}
exports.scanEthereumExplorerBlocks = scanEthereumExplorerBlocks;
//# sourceMappingURL=ethereum-explorer.js.map