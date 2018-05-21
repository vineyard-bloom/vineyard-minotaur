"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vineyard_blockchain_1 = require("vineyard-blockchain");
class DepositMonitor {
    constructor(model, client, currency, minimumConfirmations, transactionHandler) {
        this.model = model;
        this.client = client;
        this.currency = currency;
        this.minimumConfirmations = minimumConfirmations;
        this.transactionHandler = transactionHandler;
    }
    convertStatus(highestBlock, source) {
        return highestBlock - source.blockIndex >= this.minimumConfirmations
            ? vineyard_blockchain_1.blockchain.TransactionStatus.accepted
            : vineyard_blockchain_1.blockchain.TransactionStatus.pending;
    }
    async saveExternalTransaction(source, blockIndex) {
        try {
            const existing = await this.model.getTransactionByTxid(source.txid);
            if (existing) {
                return existing;
            }
        }
        catch (error) {
            console.error('Error checking for existing transaction', error, source);
            return undefined;
        }
        try {
            const transaction = await this.model.saveTransaction({
                txid: source.txid,
                to: source.to,
                from: source.from,
                status: this.convertStatus(blockIndex, source),
                amount: source.amount,
                timeReceived: source.timeReceived,
                blockIndex,
                currency: this.currency.id
            });
            this.transactionHandler.onSave(transaction);
            if (blockIndex - source.blockIndex >= this.minimumConfirmations) {
                return await this.transactionHandler.onConfirm(transaction);
            }
        }
        catch (error) {
            console.error('Error saving transaction', error, source);
            return undefined;
        }
    }
    async saveExternalTransactions(transactions, blockIndex) {
        for (let transaction of transactions) {
            if (await this.transactionHandler.shouldTrackTransaction(transaction)) {
                await this.saveExternalTransaction(transaction, blockIndex);
            }
        }
    }
    async confirmExistingTransaction(transaction) {
        const ExternalTransaction = await this.model.setTransactionStatus(transaction, vineyard_blockchain_1.blockchain.TransactionStatus.accepted);
        return await this.transactionHandler.onConfirm(ExternalTransaction);
    }
    async updatePendingTransaction(transaction) {
        const transactionFromDatabase = await this.model.getTransactionByTxid(transaction.txid);
        if (transactionFromDatabase && transactionFromDatabase.status == vineyard_blockchain_1.blockchain.TransactionStatus.pending)
            return await this.confirmExistingTransaction(transaction);
        return transaction;
    }
    async scanBlocks() {
        let lastBlock = await this.model.getLastBlock();
        do {
            const offsetAmount = lastBlock && lastBlock.blockIndex !== undefined ? lastBlock.blockIndex - this.minimumConfirmations : 0;
            const offsetBlock = offsetAmount > 0 ? offsetAmount : 0;
            await this.gatherTransactions({ blockIndex: lastBlock.blockIndex });
            lastBlock = await this.gatherTransactions(lastBlock);
        } while (lastBlock);
    }
    async gatherTransactions(lastBlock) {
        const blockInfo = await this.client.getNextBlockInfo(lastBlock ? lastBlock.blockIndex : 0);
        if (!blockInfo)
            return undefined;
        const fullBlock = await this.client.getFullBlock(blockInfo.index);
        if (!fullBlock) {
            console.error('Invalid block', blockInfo);
            return undefined;
        }
        const block = {
            blockIndex: fullBlock.index,
            currency: this.currency.id
        };
        if (!fullBlock.transactions) {
            return block;
        }
        await this.saveExternalTransactions(fullBlock.transactions, block.blockIndex);
        return this.model.setLastBlock(block);
    }
    async updatePendingTransactions(maxBlockIndex) {
        const transactions = await this.model.listPending(maxBlockIndex);
        for (let transaction of transactions) {
            try {
                await this.updatePendingTransaction(transaction);
            }
            catch (error) {
                console.error('Bitcoin Transaction Pending Error', error, transaction);
            }
        }
    }
    async update() {
        const block = await this.client.getBlockIndex();
        await this.updatePendingTransactions(block - this.minimumConfirmations);
        await this.scanBlocks();
    }
}
exports.DepositMonitor = DepositMonitor;
//# sourceMappingURL=deposit-monitor.js.map