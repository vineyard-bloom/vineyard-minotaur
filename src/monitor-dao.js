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
function getTransactionByTxidAndCurrency(transactionCollection, txid, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield transactionCollection.first({
            txid: txid,
            currency: currency
        }).exec();
    });
}
exports.getTransactionByTxidAndCurrency = getTransactionByTxidAndCurrency;
function saveTransaction(transactionCollection, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield transactionCollection.create(transaction);
    });
}
exports.saveTransaction = saveTransaction;
function setStatus(transactionCollection, transaction, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield transactionCollection.update(transaction, {
            status: status
        });
    });
}
exports.setStatus = setStatus;
function listPendingTransactions(ground, transactionCollection, currency, maxBlockIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    SELECT transactions.* FROM transactions
    JOIN blocks ON blocks.id = transactions.block
    AND blocks.index < :maxBlockIndex
    WHERE status = 0 AND transactions.currency = :currency`;
        return yield ground.query(sql, {
            maxBlockIndex: maxBlockIndex,
            currency: currency
        });
    });
}
exports.listPendingTransactions = listPendingTransactions;
function getLastBlock(ground, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
  SELECT * FROM blocks
  JOIN last_blocks ON last_blocks.block = blocks.id
  `;
        return ground.querySingle(sql);
    });
}
exports.getLastBlock = getLastBlock;
function setLastBlock(ground, currency, block) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `UPDATE last_blocks SET block = :block WHERE currency = :currency`;
        return yield ground.query(sql, {
            block: block,
            currency: currency,
        });
    });
}
exports.setLastBlock = setLastBlock;
function saveBlock(blockCollection, block) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = block.hash
            ? { currency: block.currency, hash: block.hash }
            : { currency: block.currency, index: block.index };
        const existing = yield blockCollection.first(filter);
        if (existing)
            return existing;
        return yield blockCollection.create(block);
    });
}
exports.saveBlock = saveBlock;
function createBlockDao(model) {
    return {
        saveBlock: saveBlock.bind(null, model.Block)
    };
}
exports.createBlockDao = createBlockDao;
function createLastBlockDao(ground) {
    return {
        getLastBlock: getLastBlock.bind(null, ground, 1),
        setLastBlock: setLastBlock.bind(null, ground, 1)
    };
}
exports.createLastBlockDao = createLastBlockDao;
function createTransactionDao(model) {
    const ground = model.ground;
    return {
        getTransactionByTxid: getTransactionByTxidAndCurrency.bind(null, model.Transaction),
        saveTransaction: saveTransaction.bind(null, model.Transaction),
        setStatus: setStatus.bind(null, model.Transaction),
    };
}
exports.createTransactionDao = createTransactionDao;
function createMonitorDao(model) {
    return {
        blockDao: createBlockDao(model),
        lastBlockDao: createLastBlockDao(model.ground),
        transactionDao: createTransactionDao(model)
    };
}
exports.createMonitorDao = createMonitorDao;
//# sourceMappingURL=monitor-dao.js.map