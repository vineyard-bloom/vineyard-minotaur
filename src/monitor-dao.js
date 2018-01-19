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
function getTransactionByTxid(transactionCollection, txid, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield transactionCollection.first({
            txid: txid,
            currency: currency
        }).exec();
    });
}
function saveTransaction(transactionCollection, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield transactionCollection.create(transaction);
    });
}
function setStatus(transactionCollection, transaction, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield transactionCollection.update(transaction, {
            status: status
        });
    });
}
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
function getLastBlock(ground, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
  SELECT * FROM blocks
  JOIN last_blocks ON lastblocks.block = blocks.id
  `;
        return ground.querySingle(sql);
    });
}
function setLastBlock(ground, block, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `UPDATE last_blocks SET block = :block WHERE currency = :currency`;
        return yield ground.query(sql, {
            block: block,
            currency: currency,
        });
    });
}
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
function createMonitorDao(model) {
    const ground = model.ground;
    return {
        getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
        saveTransaction: saveTransaction.bind(null, model.Transaction),
        setStatus: setStatus.bind(null, model.Transaction),
        listPendingTransactions: listPendingTransactions.bind(null, ground),
        getLastBlock: getLastBlock.bind(null, ground),
        setLastBlock: setLastBlock.bind(null, ground),
        saveBlock: saveBlock.bind(null, model.Block)
    };
}
exports.createMonitorDao = createMonitorDao;
//# sourceMappingURL=monitor-dao.js.map