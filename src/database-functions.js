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
function getOrCreateAddresses(ground, addresses) {
    return __awaiter(this, void 0, void 0, function () {
        var addressClauses, i, header, sql, rows, _i, rows_1, row, inserts, i, value, insertHeader, sql, rows, _a, rows_2, row;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    addressClauses = [];
                    for (i in addresses) {
                        addressClauses.push("'" + i + "'");
                    }
                    if (addressClauses.length == 0)
                        return [2 /*return*/, Promise.resolve()];
                    header = "SELECT \"id\", \"address\" FROM addresses\n  WHERE \"address\" IN (\n  ";
                    sql = header + addressClauses.join(',\n') + ');';
                    return [4 /*yield*/, ground.query(sql)];
                case 1:
                    rows = _b.sent();
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        addresses[row.address] = parseInt(row.id);
                    }
                    inserts = [];
                    for (i in addresses) {
                        value = addresses[i];
                        if (value === -1) {
                            inserts.push("('" + i + "', NOW(), NOW())");
                        }
                    }
                    if (inserts.length == 0)
                        return [2 /*return*/, Promise.resolve()];
                    insertHeader = 'INSERT INTO "addresses" ("address", "created", "modified") VALUES\n';
                    sql = insertHeader + inserts.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";';
                    return [4 /*yield*/, ground.query(sql)];
                case 2:
                    rows = _b.sent();
                    for (_a = 0, rows_2 = rows; _a < rows_2.length; _a++) {
                        row = rows_2[_a];
                        addresses[row.address.trim()] = parseInt(row.id);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getOrCreateAddresses = getOrCreateAddresses;
function addressesAreAssociated(addresses) {
    for (var i in addresses) {
        if (addresses[i] === -1)
            return false;
    }
    return true;
}
exports.addressesAreAssociated = addressesAreAssociated;
function saveBlocks(ground, blocks) {
    return __awaiter(this, void 0, void 0, function () {
        var header, inserts, _i, blocks_1, block, sql;
        return __generator(this, function (_a) {
            header = 'INSERT INTO "blocks" ("index", "hash", "timeMined", "created", "modified") VALUES\n';
            inserts = [];
            for (_i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
                block = blocks_1[_i];
                inserts.push("(" + block.index + ", '" + block.hash + "', '" + block.timeMined.toISOString() + "', NOW(), NOW())");
            }
            sql = header + inserts.join(',\n') + ' ON CONFLICT DO NOTHING;';
            return [2 /*return*/, ground.querySingle(sql)];
        });
    });
}
exports.saveBlocks = saveBlocks;
function saveCurrencies(ground, tokenContracts) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _i, tokenContracts_1, contract, token, record;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = [];
                    _i = 0, tokenContracts_1 = tokenContracts;
                    _a.label = 1;
                case 1:
                    if (!(_i < tokenContracts_1.length)) return [3 /*break*/, 4];
                    contract = tokenContracts_1[_i];
                    token = contract;
                    return [4 /*yield*/, ground.collections.Currency.create({
                            name: token.name
                        })];
                case 2:
                    record = _a.sent();
                    result.push({
                        currency: record,
                        tokenContract: token
                    });
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
exports.saveCurrencies = saveCurrencies;
function getNextBlock(lastBlockDao) {
    return __awaiter(this, void 0, void 0, function () {
        var lastBlockIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, lastBlockDao.getLastBlock()];
                case 1:
                    lastBlockIndex = _a.sent();
                    return [2 /*return*/, typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0];
            }
        });
    });
}
exports.getNextBlock = getNextBlock;
function saveSingleTransactions(ground, transactions, addresses) {
    var header = 'INSERT INTO "transactions" ("status", "txid", "to", "from", "amount", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
    var transactionClauses = transactions.map(function (t) {
        var to = t.to ? addresses[t.to] : 'NULL';
        var from = t.from ? addresses[t.from] : 'NULL';
        return "(" + t.status + ", '" + t.txid + "', " + to + ", " + from + ", " + t.amount + ", " + t.fee + ", " + t.nonce + ", 2, '" + t.timeReceived.toISOString() + "', " + t.blockIndex + ", NOW(), NOW())";
    });
    if (transactionClauses.length == 0)
        return Promise.resolve();
    var sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
}
exports.saveSingleTransactions = saveSingleTransactions;
