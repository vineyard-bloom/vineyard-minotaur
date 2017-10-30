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
class TransactionMonitor {
    constructor(model, client, currency, minimumConfirmations) {
        this.model = model;
        this.client = client;
        this.currency = currency;
        this.minimumConfirmations = minimumConfirmations;
    }
    convertStatus(source) {
        return source.confirmations >= this.minimumConfirmations
            ? vineyard_blockchain_1.TransactionStatus.accepted
            : vineyard_blockchain_1.TransactionStatus.pending;
    }
    saveExternalTransaction(source, block) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existing = yield this.model.getTransactionByTxid(source.txid, this.currency.id);
                if (existing) {
                    return existing;
                }
            }
            catch (error) {
                console.error('Error checking for existing transaction', error, source);
                return undefined;
            }
            try {
                const transaction = yield this.model.saveTransaction({
                    txid: source.txid,
                    to: source.to,
                    from: source.from,
                    status: this.convertStatus(source),
                    amount: source.amount,
                    timeReceived: source.timeReceived,
                    block: block.id
                });
                if (source.confirmations >= this.minimumConfirmations) {
                    return yield this.model.onConfirm(transaction);
                }
            }
            catch (error) {
                console.error('Error saving transaction', error, source);
                return undefined;
            }
        });
    }
    saveExternalTransactions(transactions, block) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let transaction of transactions) {
                yield this.saveExternalTransaction(transaction, block);
            }
        });
    }
    confirmExistingTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            transaction.status = vineyard_blockchain_1.TransactionStatus.accepted;
            const ExternalTransaction = yield this.model.setStatus(transaction, vineyard_blockchain_1.TransactionStatus.accepted);
            return yield this.model.onConfirm(ExternalTransaction);
        });
    }
    updatePendingTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = yield this.client.getTransaction(transaction.txid);
            return source.confirmations >= this.minimumConfirmations
                ? yield this.confirmExistingTransaction(transaction)
                : transaction;
        });
    }
    gatherTransactions(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastBlock = yield this.model.getLastBlock(currency);
            const blocklist = yield this.client.getNextFullBlock(lastBlock);
            if (!blocklist)
                return [];
            const block = yield this.model.saveBlock({
                hash: blocklist.hash,
                index: blocklist.index,
                timeMined: blocklist.timeMined,
                currency: this.currency.id
            });
            if (blocklist.transactions.length == 0)
                return [];
            yield this.saveExternalTransactions(blocklist.transactions, block);
            return blocklist.lastBlock
                ? yield this.model.setLastBlockByHash(blocklist.lastBlock, currency)
                    .then(() => [])
                : Promise.resolve([]);
        });
    }
    updatePendingTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield this.model.listPending(this.currency.id);
            for (let transaction of transactions) {
                try {
                    yield this.updatePendingTransaction(transaction);
                }
                catch (error) {
                    console.error('Bitcoin Transaction Pending Error', error, transaction);
                }
            }
        });
    }
    update() {
        return this.updatePendingTransactions()
            .then(() => this.gatherExternalTransactions());
    }
}
exports.TransactionMonitor = TransactionMonitor;
//# sourceMappingURL=transaction-monitor.js.map