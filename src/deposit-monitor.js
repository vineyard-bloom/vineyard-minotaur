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
var vineyard_blockchain_1 = require("vineyard-blockchain");
var DepositMonitor = (function () {
    function DepositMonitor(model, client, currency, minimumConfirmations, transactionHandler) {
        this.model = model;
        this.client = client;
        this.currency = currency;
        this.minimumConfirmations = minimumConfirmations;
        this.transactionHandler = transactionHandler;
    }
    DepositMonitor.prototype.convertStatus = function (highestBlock, source) {
        return highestBlock - source.blockIndex >= this.minimumConfirmations
            ? vineyard_blockchain_1.blockchain.TransactionStatus.accepted
            : vineyard_blockchain_1.blockchain.TransactionStatus.pending;
    };
    DepositMonitor.prototype.saveExternalTransaction = function (source, block) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, error_1, transaction, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.model.getTransactionByTxid(source.txid)];
                    case 1:
                        existing = _a.sent();
                        if (existing) {
                            return [2 /*return*/, existing];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error checking for existing transaction', error_1, source);
                        return [2 /*return*/, undefined];
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, this.model.saveTransaction({
                                txid: source.txid,
                                to: source.to,
                                from: source.from,
                                status: this.convertStatus(block.index, source),
                                amount: source.amount,
                                timeReceived: source.timeReceived,
                                block: block.index,
                                currency: this.currency.id
                            })];
                    case 4:
                        transaction = _a.sent();
                        this.transactionHandler.onSave(transaction);
                        if (!(block.index - source.blockIndex >= this.minimumConfirmations)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.transactionHandler.onConfirm(transaction)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        console.error('Error saving transaction', error_2, source);
                        return [2 /*return*/, undefined];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    DepositMonitor.prototype.saveExternalTransactions = function (transactions, block) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, transactions_1, transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, transactions_1 = transactions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < transactions_1.length)) return [3 /*break*/, 5];
                        transaction = transactions_1[_i];
                        return [4 /*yield*/, this.transactionHandler.shouldTrackTransaction(transaction)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.saveExternalTransaction(transaction, block)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DepositMonitor.prototype.confirmExistingTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var ExternalTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.setTransactionStatus(transaction, vineyard_blockchain_1.blockchain.TransactionStatus.accepted)];
                    case 1:
                        ExternalTransaction = _a.sent();
                        return [4 /*yield*/, this.transactionHandler.onConfirm(ExternalTransaction)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DepositMonitor.prototype.updatePendingTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionFromDatabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.getTransactionByTxid(transaction.txid)];
                    case 1:
                        transactionFromDatabase = _a.sent();
                        if (!(transactionFromDatabase && transactionFromDatabase.status == vineyard_blockchain_1.blockchain.TransactionStatus.pending)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.confirmExistingTransaction(transaction)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, transaction];
                }
            });
        });
    };
    DepositMonitor.prototype.scanBlocks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastBlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.getLastBlock()];
                    case 1:
                        lastBlock = _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.gatherTransactions(lastBlock)];
                    case 3:
                        lastBlock = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (lastBlock) return [3 /*break*/, 2];
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DepositMonitor.prototype.gatherTransactions = function (lastBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var blockInfo, fullBlock, block, newLastBlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.getNextBlockInfo(lastBlock)];
                    case 1:
                        blockInfo = _a.sent();
                        if (!blockInfo)
                            return [2 /*return*/, undefined];
                        return [4 /*yield*/, this.client.getFullBlock(blockInfo)];
                    case 2:
                        fullBlock = _a.sent();
                        if (!fullBlock) {
                            console.error('Invalid block', blockInfo);
                            return [2 /*return*/, undefined];
                        }
                        block = {
                            hash: fullBlock.hash,
                            index: fullBlock.index,
                            timeMined: fullBlock.timeMined,
                            currency: this.currency.id
                        };
                        if (!fullBlock.transactions) {
                            return [2 /*return*/, block];
                        }
                        return [4 /*yield*/, this.saveExternalTransactions(fullBlock.transactions, block)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.model.setLastBlock(block)];
                    case 4:
                        newLastBlock = _a.sent();
                        return [2 /*return*/, newLastBlock];
                }
            });
        });
    };
    DepositMonitor.prototype.updatePendingTransactions = function (maxBlockIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var transactions, _i, transactions_2, transaction, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.listPending(maxBlockIndex)];
                    case 1:
                        transactions = _a.sent();
                        _i = 0, transactions_2 = transactions;
                        _a.label = 2;
                    case 2:
                        if (!(_i < transactions_2.length)) return [3 /*break*/, 7];
                        transaction = transactions_2[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.updatePendingTransaction(transaction)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.error('Bitcoin Transaction Pending Error', error_3, transaction);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DepositMonitor.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.getBlockIndex()];
                    case 1:
                        block = _a.sent();
                        return [4 /*yield*/, this.updatePendingTransactions(block - this.minimumConfirmations)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.scanBlocks()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DepositMonitor;
}());
exports.DepositMonitor = DepositMonitor;
