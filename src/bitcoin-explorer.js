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
const utility_1 = require("./utility");
const index_1 = require("./utility/index");
const database_functions_1 = require("./database-functions");
const monitor_logic_1 = require("./monitor-logic");
function gatherAddresses(blocks) {
    const addresses = {};
    for (let block of blocks) {
        for (let transaction of block.transactions) {
            for (let output of transaction.outputs) {
                addresses[output.scriptPubKey.addresses[0]] = -1;
            }
        }
    }
    return addresses;
}
function saveTransactions(ground, transactions, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!database_functions_1.addressesAreAssociated(addresses))
            throw new Error("Not all addresses were properly saved or loaded");
        if (transactions.length == 0)
            return Promise.resolve();
        const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
        const transactionClauses = transactions.map(t => {
            return `(${t.status}, '${t.txid}', ${t.fee}, ${t.nonce}, 1, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`;
        });
        const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
        yield ground.querySingle(sql);
        const inputs = index_1.flatMap(transactions, mapTransactionInputs);
        const outputs = index_1.flatMap(transactions, mapTransactionOutputs);
        yield saveTransactionInputs(ground, inputs, addresses);
        yield saveTransactionOutputs(ground, outputs, addresses);
    });
}
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
function selectTxidClause(txid) {
    return `(SELECT tx.id FROM transactions tx WHERE tx.txid = '${txid}')`;
}
function nullify(value) {
    return (value === undefined || value === null) ? 'NULL' : value;
}
function nullifyString(value) {
    return (value === undefined || value === null) ? 'NULL' : "'" + value + "'";
}
function saveTransactionInputs(ground, inputs, addresses) {
    if (inputs.length == 0)
        return Promise.resolve();
    const header = 'INSERT INTO "txins" ("transaction", "index", "sourceTransaction", "sourceIndex", "scriptSigHex", "scriptSigAsm", "sequence", "address", "amount", "valueSat", "coinbase", "created", "modified") VALUES\n';
    const transactionClauses = inputs.map(association => {
        const input = association.input;
        return `(${selectTxidClause(association.txid)}, '${association.index}', ${input.txid ? selectTxidClause(input.txid) : 'NULL'}, ${nullify(input.vout)}, ${input.scriptSig ? "'" + input.scriptSig.hex + "'" : 'NULL'}, ${input.scriptSig ? "'" + input.scriptSig.asm + "'" : 'NULL'}, ${input.sequence}, ${input.address ? addresses[input.address] : 'NULL'}, ${nullify(input.amount)}, ${nullify(input.valueSat)}, ${nullifyString(input.coinbase)},  NOW(), NOW())`;
    });
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
}
function saveTransactionOutputs(ground, outputs, addresses) {
    if (outputs.length == 0)
        return Promise.resolve();
    const header = 'INSERT INTO "txouts" ("transaction", "index", "scriptPubKeyHex", "scriptPubKeyAsm", "address", "amount", "spentTxId", "spentHeight", "spentIndex", "created", "modified") VALUES\n';
    const transactionClauses = outputs.map(association => {
        const output = association.output;
        return `(${selectTxidClause(association.txid)}, ${association.index}, '${output.scriptPubKey.hex}', '${output.scriptPubKey.asm}', '${addresses[output.scriptPubKey.addresses[0]]}', ${output.value}, ${nullifyString(output.spentTxId)}, ${nullify(output.spentHeight)}, ${nullify(output.spentIndex)},  NOW(), NOW())`;
    });
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
}
function saveFullBlocks(dao, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        const ground = dao.ground;
        const transactions = index_1.flatMap(blocks, b => b.transactions);
        const addresses = gatherAddresses(blocks);
        const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index;
        yield Promise.all([
            database_functions_1.saveBlocks(ground, blocks),
            dao.lastBlockDao.setLastBlock(lastBlockIndex),
            database_functions_1.getOrCreateAddresses(dao.ground, addresses)
                .then(() => saveTransactions(ground, transactions, addresses))
        ]);
        console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
    });
}
function scanBitcoinExplorerBlocks(dao, client, config, profiler = new utility_1.EmptyProfiler()) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockQueue = yield monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue);
        const saver = (blocks) => saveFullBlocks(dao, blocks);
        return monitor_logic_1.scanBlocks(blockQueue, saver, config, profiler);
        // let blockIndex = await getNextBlock(dao.lastBlockDao)
        // const blockQueue = new ExternalBlockQueue(client, blockIndex, config.queue)
        // const startTime: number = Date.now()
        // do {
        //   const elapsed = Date.now() - startTime
        //   // console.log('Scanning block', blockIndex, 'elapsed', elapsed)
        //   if (config.maxMilliseconds && elapsed > config.maxMilliseconds) {
        //     console.log('Reached timeout of ', elapsed, 'milliseconds')
        //     console.log('Canceled blocks', blockQueue.requests.map(b => b.blockIndex).join(', '))
        //     break
        //   }
        //
        //   profiler.start('getBlocks')
        //   const blocks = await blockQueue.getBlocks()
        //   profiler.stop('getBlocks')
        //   if (blocks.length == 0) {
        //     console.log('No more blocks found.')
        //     break
        //   }
        //
        //   console.log('Saving blocks', blocks.map(b => b.index).join(', '))
        //
        //   profiler.start('saveBlocks')
        //   await saveFullBlocks(dao, blocks)
        //   profiler.stop('saveBlocks')
        //
        //   // console.log('Saved blocks', blocks.map(b => b.index))
        // }
        // while (true)
    });
}
exports.scanBitcoinExplorerBlocks = scanBitcoinExplorerBlocks;
//# sourceMappingURL=bitcoin-explorer.js.map