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
function saveSingleCurrencyTransaction(transactionCollection, getOrCreateAddress, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const to = transaction.to ? (yield getOrCreateAddress(transaction.to)) : undefined;
        const from = transaction.from ? (yield getOrCreateAddress(transaction.from)) : undefined;
        const data = {
            txid: transaction.txid,
            amount: transaction.amount,
            to: to,
            from: from,
            timeReceived: transaction.timeReceived,
            status: transaction.status,
            blockIndex: transaction.blockIndex,
        };
        yield transactionCollection.create(data);
    });
}
exports.saveSingleCurrencyTransaction = saveSingleCurrencyTransaction;
function createSingleCurrencyTransactionDao(model) {
    const getOrCreateAddress = (externalAddress) => getOrCreateAddressReturningId(model.Address, externalAddress);
    return {
        getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
        saveTransaction: (transaction) => saveSingleCurrencyTransaction(model.Transaction, getOrCreateAddress, transaction),
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
        transactionDao: createSingleCurrencyTransactionDao(model)
    };
}
exports.createEthereumExplorerDao = createEthereumExplorerDao;
function getAverage(values) {
    let sum = 0;
    for (let value of values) {
        sum += value / values.length;
    }
    return sum;
}
class Profiler {
    constructor() {
        this.profiles = {};
        this.previous = '';
    }
    start(name) {
        const profile = this.profiles[name] = (this.profiles[name] || { samples: [] });
        profile.timer = process.hrtime();
        this.previous = name;
    }
    stop(name = this.previous) {
        const profile = this.profiles[name];
        profile.samples.push(process.hrtime(profile.timer));
        profile.timer = undefined;
    }
    next(name) {
        this.stop(this.previous);
        this.start(name);
    }
    formatAverage(samples, index) {
        const average = Math.round(getAverage(samples.map(t => t[index]))).toString();
        return average.padStart(16, ' ');
    }
    log() {
        console.log('Profile results:');
        for (let i in this.profiles) {
            const profile = this.profiles[i];
            const average1 = this.formatAverage(profile.samples, 0);
            const average2 = this.formatAverage(profile.samples, 1);
            console.log(' ', i.toString().padStart(30, ' '), average1, average2);
        }
    }
}
function scanEthereumExplorerBlocksProfiled(dao, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const lastBlockIndex = yield dao.lastBlockDao.getLastBlock();
        let blockIndex = typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0;
        const initial = blockIndex;
        const profiler = new Profiler();
        do {
            profiler.start('getBlockInfo');
            const block = yield client.getBlockInfo(blockIndex);
            if (!block)
                return;
            profiler.next('getBlockTransactions');
            const transactions = yield client.getBlockTransactions(block);
            profiler.next('saveBlock');
            yield dao.blockDao.saveBlock(block);
            profiler.next('saveTransactions');
            for (let transaction of transactions) {
                yield dao.transactionDao.saveTransaction(transaction);
            }
            profiler.next('setLastBlock');
            yield dao.lastBlockDao.setLastBlock(block.index);
            profiler.stop();
            blockIndex = block.index + 1;
        } while (blockIndex < initial + 10);
        profiler.log();
        process.exit();
    });
}
exports.scanEthereumExplorerBlocksProfiled = scanEthereumExplorerBlocksProfiled;
function scanEthereumExplorerBlocks(dao, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const lastBlockIndex = yield dao.lastBlockDao.getLastBlock();
        let blockIndex = typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0;
        do {
            const block = yield client.getBlockInfo(blockIndex);
            if (!block)
                break;
            const transactions = yield client.getBlockTransactions(block);
            dao.blockDao.saveBlock(block);
            for (let transaction of transactions) {
                dao.transactionDao.saveTransaction(transaction);
            }
            blockIndex = block.index + 1;
        } while (true);
        yield dao.lastBlockDao.setLastBlock(blockIndex - 1);
    });
}
exports.scanEthereumExplorerBlocks = scanEthereumExplorerBlocks;
//# sourceMappingURL=ethereum-explorer.js.map