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
const monitor_logic_1 = require("./monitor-logic");
function listPendingSingleCurrencyTransactions(ground, transactionCollection, maxBlockIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    SELECT transactions.* FROM transactions
    JOIN blocks ON blocks.id = transactions.block
    AND blocks.index < :maxBlockIndex
    WHERE status = 0`;
        return yield ground.query(sql, {
            maxBlockIndex: maxBlockIndex
        });
    });
}
exports.listPendingSingleCurrencyTransactions = listPendingSingleCurrencyTransactions;
function saveSingleCurrencyBlock(blockCollection, block) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = block.hash
            ? { hash: block.hash }
            : { index: block.index };
        const existing = yield blockCollection.first(filter);
        if (existing)
            return existing;
        return yield blockCollection.create({
            hash: block.hash,
            index: block.index,
            timeMined: block.timeMined
        });
    });
}
exports.saveSingleCurrencyBlock = saveSingleCurrencyBlock;
function getTransactionByTxid(transactionCollection, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield transactionCollection.first({
            txid: txid
        }).exec();
    });
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
            block: transaction.block,
        };
        return yield transactionCollection.create(data);
    });
}
exports.saveSingleCurrencyTransaction = saveSingleCurrencyTransaction;
function createSingleCurrencyTransactionDao(model) {
    const ground = model.ground;
    const getOrCreateAddress = getOrCreateAddressReturningId.bind(null, model.Address);
    return {
        getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
        saveTransaction: saveSingleCurrencyTransaction.bind(null, model.Transaction, getOrCreateAddress),
        setStatus: monitor_dao_1.setStatus.bind(null, model.Transaction),
        listPendingTransactions: listPendingSingleCurrencyTransactions.bind(null, ground),
    };
}
exports.createSingleCurrencyTransactionDao = createSingleCurrencyTransactionDao;
function createEthereumExplorerDao(model) {
    return {
        blockDao: {
            saveBlock: saveSingleCurrencyBlock.bind(null, model.Block)
        },
        lastBlockDao: monitor_dao_1.createLastBlockDao(model),
        transactionDao: createSingleCurrencyTransactionDao(model)
    };
}
exports.createEthereumExplorerDao = createEthereumExplorerDao;
function scanEthereumExplorerBlocks(dao, client) {
    const ethereumCurrency = { id: 1, name: "ethereum" };
    return monitor_logic_1.scanBlocksStandard(dao, client, (t) => Promise.resolve(true), (t) => Promise.resolve(t), 0, ethereumCurrency.id);
}
exports.scanEthereumExplorerBlocks = scanEthereumExplorerBlocks;
//# sourceMappingURL=ethereum-explorer.js.map