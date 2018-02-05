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
const vineyard_blockchain_1 = require("vineyard-blockchain");
function saveExternalTransaction(dao, source, block) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existing = yield dao.getTransactionByTxid(source.txid);
            if (existing) {
                return existing;
            }
        }
        catch (error) {
            console.error('Error checking for existing transaction', error, source);
            return undefined;
        }
        try {
            yield dao.saveTransaction({
                txid: source.txid,
                to: source.to,
                from: source.from,
                status: vineyard_blockchain_1.TransactionStatus.accepted,
                amount: source.amount,
                timeReceived: source.timeReceived,
                block: block.id
            });
        }
        catch (error) {
            console.error('Error saving transaction', error, source);
            return undefined;
        }
    });
}
function confirmExistingTransaction(dao, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        transaction.status = vineyard_blockchain_1.TransactionStatus.accepted;
        return yield dao.transactionDao.setStatus(transaction, vineyard_blockchain_1.TransactionStatus.accepted);
    });
}
function isReadyToConfirm(dao, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionFromDatabase = yield dao.transactionDao.getTransactionByTxid(transaction.txid);
        return !!transactionFromDatabase && transactionFromDatabase.status == vineyard_blockchain_1.TransactionStatus.pending;
    });
}
function updatePendingTransactions(dao, onConfirm, currency, maxBlockIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactions = yield dao.transactionDao.listPendingTransactions(maxBlockIndex);
        for (let transaction of transactions) {
            try {
                if (yield isReadyToConfirm(dao, transaction)) {
                    const externalTransaction = yield confirmExistingTransaction(dao, transaction);
                    yield onConfirm(externalTransaction);
                }
            }
            catch (error) {
                console.error('Bitcoin Transaction Pending Error', error, transaction);
            }
        }
    });
}
function scanBlock(dao, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield client.getBlockIndex();
    });
}
exports.scanBlock = scanBlock;
function scanExplorerBlocks(dao, client) {
    return __awaiter(this, void 0, void 0, function* () {
        let lastBlock = yield dao.lastBlockDao.getLastBlock();
        do {
            const blockInfo = yield client.getNextBlockInfo(lastBlock);
            if (!blockInfo)
                return;
            const fullBlock = yield client.getFullBlock(blockInfo);
            if (!fullBlock) {
                console.error('Invalid block', blockInfo);
                return undefined;
            }
            const block = yield dao.blockDao.saveBlock({
                hash: fullBlock.hash,
                index: fullBlock.index,
                timeMined: fullBlock.timeMined
            });
            if (!fullBlock.transactions) {
                return block;
            }
            for (let transaction of fullBlock.transactions) {
                saveExternalTransaction(dao.transactionDao, transaction, block);
            }
            yield dao.lastBlockDao.setLastBlock(block.id);
            lastBlock = block;
        } while (true);
    });
}
exports.scanExplorerBlocks = scanExplorerBlocks;
//# sourceMappingURL=monitor-logic-new.js.map