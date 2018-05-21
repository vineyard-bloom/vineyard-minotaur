"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DepositMonitorManager {
    constructor(model, currency) {
        this.model = model;
        this.currency = currency;
    }
    async getTransactionByTxid(txid) {
        return this.model.Transaction.first({ txid: txid, currency: this.currency.id }).exec();
    }
    async saveTransaction(transaction) {
        return this.model.Transaction.create(transaction);
    }
    async setTransactionStatus(transaction, status) {
        return this.model.Transaction.update(transaction, { status: status });
    }
    async listPending(maxBlockIndex) {
        const sql = `
    SELECT transactions.* FROM transactions
    WHERE status = 0 
    AND transactions.currency = :currency
    AND transactions."blockIndex" < :maxBlockIndex`;
        return this.model.ground.query(sql, {
            maxBlockIndex: maxBlockIndex,
            currency: this.currency.id
        });
    }
    async getLastBlock() {
        const last = await this.model.LastBlock.first({ currency: this.currency.id }).exec();
        if (!last) {
            return;
        }
        return last;
    }
    async setLastBlock(block) {
        const currentLastBlock = await this.getLastBlock();
        if (currentLastBlock) {
            return await this.model.LastBlock.update(currentLastBlock.currency, block);
        }
        else {
            return await this.model.LastBlock.create(block);
        }
    }
}
exports.DepositMonitorManager = DepositMonitorManager;
//# sourceMappingURL=deposit-monitor-manager.js.map