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
    const ground = model.ground;
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
        lastBlockDao: monitor_dao_1.createLastBlockDao(model.ground),
        transactionDao: createSingleCurrencyTransactionDao(model)
    };
}
exports.createEthereumExplorerDao = createEthereumExplorerDao;
function scanEthereumExplorerBlocks(dao, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const lastBlock = yield dao.lastBlockDao.getLastBlock();
        let blockIndex = lastBlock ? lastBlock.index + 1 : 0;
        do {
            const block = yield client.getBlockInfo(blockIndex);
            if (!block)
                return;
            const transactions = yield client.getBlockTransactions(block);
            yield dao.blockDao.saveBlock(block);
            for (let transaction of transactions) {
                yield dao.transactionDao.saveTransaction(transaction);
            }
            yield dao.lastBlockDao.setLastBlock(block.index);
            blockIndex = block.index + 1;
        } while (true);
    });
}
exports.scanEthereumExplorerBlocks = scanEthereumExplorerBlocks;
//# sourceMappingURL=ethereum-explorer.js.map