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
const types_1 = require("vineyard-blockchain/src/types");
function convertStatus(minimumConfirmations, source) {
    return source.confirmations >= minimumConfirmations
        ? types_1.TransactionStatus.accepted
        : types_1.TransactionStatus.pending;
}
function saveExternalTransaction(dao, currency, onConfirm, minimumConfirmations, source, block) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existing = yield dao.getTransactionByTxid(source.txid, currency);
            if (existing) {
                return existing;
            }
        }
        catch (error) {
            console.error('Error checking for existing transaction', error, source);
            return undefined;
        }
        try {
            const transaction = yield dao.saveTransaction({
                txid: source.txid,
                to: source.to,
                from: source.from,
                status: convertStatus(minimumConfirmations, source),
                amount: source.amount,
                timeReceived: source.timeReceived,
                block: block.id,
                currency: currency
            });
            if (source.confirmations >= minimumConfirmations) {
                return yield onConfirm(transaction);
            }
        }
        catch (error) {
            console.error('Error saving transaction', error, source);
            return undefined;
        }
    });
}
function confirmExistingTransaction(dao, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        transaction.status = types_1.TransactionStatus.accepted;
        return yield dao.setStatus(transaction, types_1.TransactionStatus.accepted);
    });
}
function isReadyToConfirm(dao, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionFromDatabase = yield dao.getTransactionByTxid(transaction.txid, 2);
        return !!transactionFromDatabase && transactionFromDatabase.status == types_1.TransactionStatus.pending;
    });
}
function gatherTransactions(dao, shouldTrackTransaction, saveTransaction, client, currency, lastBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockInfo = yield client.getNextBlockInfo(lastBlock);
        if (!blockInfo)
            return;
        const fullBlock = yield client.getFullBlock(blockInfo);
        if (!fullBlock) {
            console.error('Invalid block', blockInfo);
            return undefined;
        }
        const block = yield dao.saveBlock({
            hash: fullBlock.hash,
            index: fullBlock.index,
            timeMined: fullBlock.timeMined,
            currency: currency
        });
        if (!fullBlock.transactions) {
            return block;
        }
        for (let transaction of fullBlock.transactions) {
            if (yield shouldTrackTransaction(transaction)) {
                yield saveTransaction(transaction, block);
            }
        }
        yield dao.setLastBlock(block.id, currency);
        return block;
    });
}
function updatePendingTransactions(dao, onConfirm, currency, maxBlockIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactions = yield dao.listPendingTransactions(currency, maxBlockIndex);
        for (let transaction of transactions) {
            try {
                if (yield isReadyToConfirm(dao, transaction)) {
                    const ExternalTransaction = yield confirmExistingTransaction(dao, transaction);
                    yield onConfirm(ExternalTransaction);
                }
            }
            catch (error) {
                console.error('Bitcoin Transaction Pending Error', error, transaction);
            }
        }
    });
}
function update(dao, client, shouldTrackTransaction, onConfirm, minimumConfirmations, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield client.getBlockIndex();
        yield updatePendingTransactions(dao, onConfirm, currency, block - minimumConfirmations);
        const saveTransaction = saveExternalTransaction.bind(null, dao, currency, onConfirm, minimumConfirmations);
        let lastBlock = yield dao.getLastBlock(currency);
        do {
            lastBlock = yield gatherTransactions(dao, shouldTrackTransaction, saveTransaction, client, currency, lastBlock);
        } while (lastBlock);
    });
}
//# sourceMappingURL=monitor-logic.js.map