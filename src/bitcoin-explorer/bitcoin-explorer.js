"use strict";
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
async function saveTransactionInputs(ground, inputs) {
    if (inputs.length == 0)
        return Promise.resolve();
    const header = 'INSERT INTO "txins" ("transaction", "index", "sourceTransaction", "sourceIndex", "scriptSigHex", "scriptSigAsm", "sequence", "coinbase", "created", "modified") VALUES\n';
    const transactionClauses = inputs.map(association => sql_helpers_1.CREATE_TX_IN(association));
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "sourceTransaction", "sourceIndex";';
    await ground.query(sql);
}
async function saveTransactionOutputs(ground, outputs, addresses) {
    if (outputs.length == 0)
        return Promise.resolve();
    const header = 'INSERT INTO "txouts" ("transaction", "index", "scriptPubKeyHex", "scriptPubKeyAsm", "address", "amount", "created", "modified") VALUES\n';
    const transactionClauses = outputs.map(association => sql_helpers_1.CREATE_TX_OUT(association, addresses[association.output.address]));
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    await ground.querySingle(sql);
}
async function saveTransactions(ground, transactions) {
    if (transactions.length == 0)
        return Promise.resolve();
    const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
    const transactionClauses = transactions.map(sql_helpers_1.CREATE_TX);
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    await ground.querySingle(sql);
}
function gatherAddresses(outputs) {
    return [...new Set(outputs.map(o => o.output.address))];
}
async function saveFullBlocks(ground, blocks) {
    if (blocks.length === 0)
        return;
    // Can save to sortedBlocks var and set lasBlockIndex
    const transactions = index_1.flatMap(blocks, b => b.transactions);
    const inputs = index_1.flatMap(transactions, mapTransactionInputs);
    const outputs = index_1.flatMap(transactions, mapTransactionOutputs);
    const addresses = gatherAddresses(outputs);
    const addressesFromDb = await database_functions_1.getOrCreateAddresses2(ground, addresses);
    await saveTransactions(ground, transactions);
    await Promise.all([
        database_functions_1.saveBlocks(ground, blocks),
        // Add param for oldest block being saved
        saveTransactionInputs(ground, inputs),
        saveTransactionOutputs(ground, outputs, addressesFromDb)
    ]);
}
async function scanBitcoinExplorerBlocks(dao, client, config, profiler = new utility_1.EmptyProfiler()) {
    const blockQueue = await monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue, config.minConfirmations, 1);
    const saver = (blocks) => saveFullBlocks(dao.ground, blocks);
    return monitor_logic_1.scanBlocks(blockQueue, saver, dao.ground, dao.lastBlockDao, config, profiler);
}
exports.scanBitcoinExplorerBlocks = scanBitcoinExplorerBlocks;
//# sourceMappingURL=bitcoin-explorer.js.map