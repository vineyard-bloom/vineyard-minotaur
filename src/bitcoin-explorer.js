"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utility_1 = require("./utility");
var index_1 = require("./utility/index");
var database_functions_1 = require("./database-functions");
var monitor_logic_1 = require("./monitor-logic");
function gatherAddresses(blocks) {
    var addresses = {};
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var block = blocks_1[_i];
        for (var _a = 0, _b = block.transactions; _a < _b.length; _a++) {
            var transaction = _b[_a];
            for (var _c = 0, _d = transaction.outputs; _c < _d.length; _c++) {
                var output = _d[_c];
                addresses[output.scriptPubKey.addresses[0]] = -1;
            }
        }
    }
    return addresses;
}
function saveTransactions(ground, transactions, addresses) {
    return __awaiter(this, void 0, void 0, function () {
        var header, transactionClauses, sql, inputs, outputs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!database_functions_1.addressesAreAssociated(addresses))
                        throw new Error("Not all addresses were properly saved or loaded");
                    if (transactions.length == 0)
                        return [2 /*return*/, Promise.resolve()];
                    header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
                    transactionClauses = transactions.map(function (t) {
                        return "(" + t.status + ", '" + t.txid + "', " + t.fee + ", " + t.nonce + ", 1, '" + t.timeReceived.toISOString() + "', " + t.blockIndex + ", NOW(), NOW())";
                    });
                    sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
                    return [4 /*yield*/, ground.querySingle(sql)];
                case 1:
                    _a.sent();
                    inputs = index_1.flatMap(transactions, mapTransactionInputs);
                    outputs = index_1.flatMap(transactions, mapTransactionOutputs);
                    return [4 /*yield*/, saveTransactionInputs(ground, inputs, addresses)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, saveTransactionOutputs(ground, outputs, addresses)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function mapTransactionInputs(transaction) {
    return transaction.inputs.map(function (input, index) { return ({
        txid: transaction.txid,
        index: index,
        input: input
    }); });
}
function mapTransactionOutputs(transaction) {
    return transaction.outputs.map(function (output, index) { return ({
        txid: transaction.txid,
        index: index,
        output: output
    }); });
}
function selectTxidClause(txid) {
    return "(SELECT tx.id FROM transactions tx WHERE tx.txid = '" + txid + "')";
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
    var header = 'INSERT INTO "txins" ("transaction", "index", "sourceTransaction", "sourceIndex", "scriptSigHex", "scriptSigAsm", "sequence", "address", "amount", "valueSat", "coinbase", "created", "modified") VALUES\n';
    var transactionClauses = inputs.map(function (association) {
        var input = association.input;
        return "(" + selectTxidClause(association.txid) + ", '" + association.index + "', " + (input.txid ? selectTxidClause(input.txid) : 'NULL') + ", " + nullify(input.vout) + ", " + (input.scriptSig ? "'" + input.scriptSig.hex + "'" : 'NULL') + ", " + (input.scriptSig ? "'" + input.scriptSig.asm + "'" : 'NULL') + ", " + input.sequence + ", " + (input.address ? addresses[input.address] : 'NULL') + ", " + nullify(input.amount) + ", " + nullify(input.valueSat) + ", " + nullifyString(input.coinbase) + ",  NOW(), NOW())";
    });
    var sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
}
function saveTransactionOutputs(ground, outputs, addresses) {
    if (outputs.length == 0)
        return Promise.resolve();
    var header = 'INSERT INTO "txouts" ("transaction", "index", "scriptPubKeyHex", "scriptPubKeyAsm", "address", "amount", "spentTxId", "spentHeight", "spentIndex", "created", "modified") VALUES\n';
    var transactionClauses = outputs.map(function (association) {
        var output = association.output;
        return "(" + selectTxidClause(association.txid) + ", " + association.index + ", '" + output.scriptPubKey.hex + "', '" + output.scriptPubKey.asm + "', '" + addresses[output.scriptPubKey.addresses[0]] + "', " + output.value + ", " + nullifyString(output.spentTxId) + ", " + nullify(output.spentHeight) + ", " + nullify(output.spentIndex) + ",  NOW(), NOW())";
    });
    var sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
}
function saveFullBlocks(dao, blocks) {
    return __awaiter(this, void 0, void 0, function () {
        var ground, transactions, addresses, lastBlockIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ground = dao.ground;
                    transactions = index_1.flatMap(blocks, function (b) { return b.transactions; });
                    addresses = gatherAddresses(blocks);
                    lastBlockIndex = blocks.sort(function (a, b) { return b.index - a.index; })[0].index;
                    return [4 /*yield*/, Promise.all([
                            database_functions_1.saveBlocks(ground, blocks),
                            dao.lastBlockDao.setLastBlock(lastBlockIndex),
                            database_functions_1.getOrCreateAddresses(dao.ground, addresses)
                                .then(function () { return saveTransactions(ground, transactions, addresses); })
                        ])];
                case 1:
                    _a.sent();
                    console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
                    return [2 /*return*/];
            }
        });
    });
}
function scanBitcoinExplorerBlocks(dao, client, config, profiler) {
    if (profiler === void 0) { profiler = new utility_1.EmptyProfiler(); }
    return __awaiter(this, void 0, void 0, function () {
        var blockQueue, saver;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue)];
                case 1:
                    blockQueue = _a.sent();
                    saver = function (blocks) { return saveFullBlocks(dao, blocks); };
                    return [2 /*return*/, monitor_logic_1.scanBlocks(blockQueue, saver, config, profiler)
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
                    ];
            }
        });
    });
}
exports.scanBitcoinExplorerBlocks = scanBitcoinExplorerBlocks;
