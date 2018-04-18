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
const utility_1 = require("../utility");
const index_1 = require("../utility/index");
const database_functions_1 = require("../database-functions");
const monitor_logic_1 = require("../monitor-logic");
const sql_helpers_1 = require("./sql-helpers");
function mapTransactionInputs(transaction) {
    return transaction.inputs.map((input, index) => ({
        txid: transaction.txid,
        index: index,
        input: input
    }));
}
function mapTransactionOutputs(transaction) {
    return transaction.outputs.map((output, index) => ({
        txid: transaction.txid,
        index: index,
        output: output
    }));
}
function saveTransactionInputs(ground, inputs, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        if (inputs.length == 0)
            return Promise.resolve();
        const header = 'INSERT INTO "txins" ("transaction", "index", "sourceTransaction", "sourceIndex", "scriptSigHex", "scriptSigAsm", "sequence", "address", "amount", "valueSat", "coinbase", "created", "modified") VALUES\n';
        const transactionClauses = inputs.map(association => sql_helpers_1.CREATE_TX_IN(association, addresses[association.input.address || 'NOT_FOUND']));
        const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "transaction", "index";';
        const createdInputs = yield ground.query(sql);
        const x = 3;
    });
}
function saveTransactionOutputs(ground, outputs, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        if (outputs.length == 0)
            return Promise.resolve();
        const header = 'INSERT INTO "txouts" ("transaction", "index", "scriptPubKeyHex", "scriptPubKeyAsm", "address", "amount", "spentTxId", "spentHeight", "spentIndex", "created", "modified") VALUES\n';
        const transactionClauses = outputs.map(association => sql_helpers_1.CREATE_TX_OUT(association, addresses[association.output.scriptPubKey.addresses[0]]));
        const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
        yield ground.querySingle(sql);
    });
}
function saveTransactions(ground, transactions) {
    return __awaiter(this, void 0, void 0, function* () {
        if (transactions.length == 0)
            return Promise.resolve();
        const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
        const transactionClauses = transactions.map(sql_helpers_1.CREATE_TX);
        const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
        yield ground.querySingle(sql);
    });
}
function gatherAddresses(inputs, outputs) {
    const outputAddresses = index_1.flatMap(outputs, o => o.output.scriptPubKey.addresses);
    const inputAddresses = inputs.filter(i => i.input.address).map(i => i.input.address);
    return [...new Set([...outputAddresses, ...inputAddresses])];
}
function saveFullBlocks(dao, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ground } = dao;
        const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index;
        const transactions = index_1.flatMap(blocks, b => b.transactions);
        const inputs = index_1.flatMap(transactions, mapTransactionInputs);
        const outputs = index_1.flatMap(transactions, mapTransactionOutputs).filter(o => o.output.scriptPubKey.addresses);
        const addresses = gatherAddresses(inputs, outputs);
        const addressesFromDb = yield database_functions_1.getOrCreateAddresses2(ground, addresses);
        yield Promise.all([
            database_functions_1.saveBlocks(ground, blocks),
            dao.lastBlockDao.setLastBlock(lastBlockIndex),
            yield saveTransactions(ground, transactions),
            yield saveTransactionInputs(ground, inputs, addressesFromDb),
            yield saveTransactionOutputs(ground, outputs, addressesFromDb)
        ]);
        console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
    });
}
function scanBitcoinExplorerBlocks(dao, client, config, profiler = new utility_1.EmptyProfiler()) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockQueue = yield monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue);
        const saver = (blocks) => saveFullBlocks(dao, blocks);
        return monitor_logic_1.scanBlocks(blockQueue, saver, config, profiler);
    });
}
exports.scanBitcoinExplorerBlocks = scanBitcoinExplorerBlocks;
//# sourceMappingURL=bitcoin-explorer.js.map