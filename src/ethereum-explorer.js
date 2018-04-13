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
var monitor_dao_1 = require("./monitor-dao");
var vineyard_blockchain_1 = require("vineyard-blockchain");
var utility_1 = require("./utility");
var index_1 = require("./utility/index");
var database_functions_1 = require("./database-functions");
var monitor_logic_1 = require("./monitor-logic");
function saveSingleCurrencyBlock(blockCollection, block) {
    return __awaiter(this, void 0, void 0, function () {
        var existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, blockCollection.first({ index: block.index })];
                case 1:
                    existing = _a.sent();
                    if (existing)
                        return [2 /*return*/];
                    return [4 /*yield*/, blockCollection.create(block)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveSingleCurrencyBlock = saveSingleCurrencyBlock;
function getTransactionByTxid(transactionCollection, txid) {
    return transactionCollection.first({ txid: txid }).exec();
}
exports.getTransactionByTxid = getTransactionByTxid;
function getOrCreateAddressReturningId(addressCollection, externalAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var internalAddress, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, addressCollection.first({ address: externalAddress })];
                case 1:
                    internalAddress = _b.sent();
                    if (!internalAddress) return [3 /*break*/, 2];
                    _a = internalAddress.id;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, addressCollection.create({ address: externalAddress })];
                case 3:
                    _a = (_b.sent()).id;
                    _b.label = 4;
                case 4: return [2 /*return*/, _a];
            }
        });
    });
}
exports.getOrCreateAddressReturningId = getOrCreateAddressReturningId;
function createSingleCurrencyTransactionDao(model) {
    var _this = this;
    return {
        getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
        saveTransaction: function (transaction) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, model.Transaction.create(transaction)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        setStatus: monitor_dao_1.setStatus.bind(null, model.Transaction)
    };
}
exports.createSingleCurrencyTransactionDao = createSingleCurrencyTransactionDao;
function createEthereumExplorerDao(model) {
    return {
        blockDao: {
            saveBlock: function (block) { return saveSingleCurrencyBlock(model.Block, block); }
        },
        lastBlockDao: monitor_dao_1.createIndexedLastBlockDao(model.ground, 2),
        // transactionDao: createSingleCurrencyTransactionDao(model),
        getOrCreateAddress: function (externalAddress) { return getOrCreateAddressReturningId(model.Address, externalAddress); },
        ground: model.ground
    };
}
exports.createEthereumExplorerDao = createEthereumExplorerDao;
function gatherAddresses(blocks, contracts, tokenTransfers) {
    var addresses = {};
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var block = blocks_1[_i];
        for (var _a = 0, _b = block.transactions; _a < _b.length; _a++) {
            var transaction = _b[_a];
            if (transaction.to)
                addresses[transaction.to] = -1;
            if (transaction.from)
                addresses[transaction.from] = -1;
        }
    }
    for (var _c = 0, contracts_1 = contracts; _c < contracts_1.length; _c++) {
        var contract = contracts_1[_c];
        addresses[contract.address] = -1;
    }
    for (var _d = 0, tokenTransfers_1 = tokenTransfers; _d < tokenTransfers_1.length; _d++) {
        var transfer = tokenTransfers_1[_d];
        addresses[transfer.decoded.args.to] = -1;
        addresses[transfer.decoded.args.from] = -1;
    }
    return addresses;
}
function setAddress(getOrCreateAddress, addresses, key) {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getOrCreateAddress(key)];
                case 1:
                    id = _a.sent();
                    addresses[key] = id;
                    return [2 /*return*/];
            }
        });
    });
}
function saveContracts(ground, contracts, addresses) {
    return __awaiter(this, void 0, void 0, function () {
        var contractClauses, header, sql, contractRecords, tokenContracts, currencyContracts, _loop_1, _i, currencyContracts_1, bundle;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (contracts.length == 0)
                        return [2 /*return*/, Promise.resolve()];
                    contractClauses = contracts.map(function (contract) {
                        return "(" + addresses[contract.address] + ", (SELECT transactions.id FROM transactions WHERE txid = '" + contract.txid + "'), NOW(), NOW())";
                    });
                    header = 'INSERT INTO "contracts" ("address", "transaction", "created", "modified") VALUES\n';
                    sql = header + contractClauses.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";';
                    return [4 /*yield*/, ground.query(sql)];
                case 1:
                    contractRecords = (_a.sent())
                        .map(function (c) { return ({
                        id: parseInt(c.id),
                        address: parseInt(c.address)
                    }); });
                    tokenContracts = contracts.filter(function (c) { return c.contractType == vineyard_blockchain_1.blockchain.ContractType.token; });
                    if (tokenContracts.length == 0)
                        return [2 /*return*/];
                    return [4 /*yield*/, database_functions_1.saveCurrencies(ground, tokenContracts)];
                case 2:
                    currencyContracts = _a.sent();
                    _loop_1 = function (bundle) {
                        var token, address, contractRecord, currency;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    token = bundle.tokenContract;
                                    address = addresses[token.address];
                                    contractRecord = contractRecords.filter(function (c) { return c.address === address; })[0];
                                    if (!contractRecord)
                                        return [2 /*return*/, "continue"];
                                    currency = bundle.currency;
                                    return [4 /*yield*/, ground.collections.Token.create({
                                            id: currency.id,
                                            contract: contractRecord.id,
                                            name: token.name,
                                            totalSupply: token.totalSupply,
                                            decimals: token.decimals.toNumber(),
                                            version: token.version,
                                            symbol: token.symbol
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, currencyContracts_1 = currencyContracts;
                    _a.label = 3;
                case 3:
                    if (!(_i < currencyContracts_1.length)) return [3 /*break*/, 6];
                    bundle = currencyContracts_1[_i];
                    return [5 /*yield**/, _loop_1(bundle)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function gatherNewContracts(blocks) {
    var result = [];
    for (var _i = 0, blocks_2 = blocks; _i < blocks_2.length; _i++) {
        var block = blocks_2[_i];
        result = result.concat(block.transactions
            .filter(function (t) { return t.newContract; })
            .map(function (t) { return t.newContract; }));
    }
    return result;
}
function gatherTokenTranferInfo(ground, pairs) {
    return __awaiter(this, void 0, void 0, function () {
        var addressClause, sql, records;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (pairs.length == 0)
                        return [2 /*return*/, Promise.resolve([])];
                    addressClause = pairs.map(function (c) { return "('" + c.address + "', '" + c.txid + "')"; }).join(',\n');
                    sql = "\n  SELECT \n    contracts.id AS \"contractId\",\n    addresses.id AS \"addressId\", \n    addresses.address,\n    tokens.id AS \"tokenId\",\n    infos.column2 AS txid\n  FROM addresses\n  JOIN contracts ON contracts.address = addresses.id\n  JOIN tokens ON tokens.contract = contracts.id\n  JOIN (VALUES\n  " + addressClause + "\n  ) infos\nON infos.column1 = addresses.address";
                    return [4 /*yield*/, ground.query(sql)];
                case 1:
                    records = _a.sent();
                    return [2 /*return*/, records.map(function (r) { return ({
                            address: r.address,
                            contractId: parseInt(r.contractId),
                            tokenId: parseInt(r.tokenId),
                            txid: r.txid
                        }); })];
            }
        });
    });
}
function gatherTokenTransfers(ground, decodeEvent, events) {
    return __awaiter(this, void 0, void 0, function () {
        var contractTransactions, infos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contractTransactions = events.map(function (e) { return ({ address: e.address, txid: e.transactionHash }); });
                    return [4 /*yield*/, gatherTokenTranferInfo(ground, contractTransactions)];
                case 1:
                    infos = _a.sent();
                    return [2 /*return*/, infos.map(function (info) {
                            var event = events.filter(function (event) { return event.transactionHash == info.txid; })[0];
                            var decoded = decodeEvent(event);
                            return {
                                original: event,
                                decoded: decoded,
                                info: info
                            };
                        })];
            }
        });
    });
}
function saveTokenTransfers(ground, tokenTransfers, addresses) {
    return __awaiter(this, void 0, void 0, function () {
        var header, transactionClauses, sql;
        return __generator(this, function (_a) {
            if (tokenTransfers.length == 0)
                return [2 /*return*/, Promise.resolve()
                    // const txs = await gatherContractTransactions(ground, tokenTransfers)
                ];
            header = 'INSERT INTO "token_transfers" ("status", "transaction", "to", "from", "amount", "currency", "created", "modified") VALUES\n';
            transactionClauses = tokenTransfers.map(function (bundle) {
                var to = addresses[bundle.decoded.args.to];
                var from = addresses[bundle.decoded.args.from];
                return "(0, (SELECT tx.id FROM transactions tx WHERE tx.txid = '" + bundle.info.txid + "'), " + to + ", " + from + ", " + bundle.decoded.args.value.toString() + ", " + bundle.info.tokenId + ", NOW(), NOW())";
            });
            sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
            return [2 /*return*/, ground.querySingle(sql)];
        });
    });
}
function saveFullBlocks(dao, decodeTokenTransfer, blocks) {
    return __awaiter(this, void 0, void 0, function () {
        var ground, transactions, events, tokenTranfers, contracts, addresses, lastBlockIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ground = dao.ground;
                    transactions = index_1.flatMap(blocks, function (b) { return b.transactions; });
                    events = index_1.flatMap(transactions, function (t) { return t.events || []; });
                    return [4 /*yield*/, gatherTokenTransfers(ground, decodeTokenTransfer, events)];
                case 1:
                    tokenTranfers = _a.sent();
                    contracts = gatherNewContracts(blocks);
                    addresses = gatherAddresses(blocks, contracts, tokenTranfers);
                    lastBlockIndex = blocks.sort(function (a, b) { return b.index - a.index; })[0].index;
                    return [4 /*yield*/, Promise.all([
                            database_functions_1.saveBlocks(ground, blocks),
                            dao.lastBlockDao.setLastBlock(lastBlockIndex),
                            database_functions_1.getOrCreateAddresses(dao.ground, addresses)
                                .then(function () { return database_functions_1.saveSingleTransactions(ground, transactions, addresses); })
                                .then(function () { return saveContracts(ground, contracts, addresses); })
                                .then(function () { return saveTokenTransfers(ground, tokenTranfers, addresses); })
                        ])];
                case 2:
                    _a.sent();
                    console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
                    return [2 /*return*/];
            }
        });
    });
}
function scanEthereumExplorerBlocks(dao, client, decodeTokenTransfer, config, profiler) {
    if (profiler === void 0) { profiler = new utility_1.EmptyProfiler(); }
    return __awaiter(this, void 0, void 0, function () {
        var blockQueue, saver;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue)];
                case 1:
                    blockQueue = _a.sent();
                    saver = function (blocks) { return saveFullBlocks(dao, decodeTokenTransfer, blocks); };
                    return [2 /*return*/, monitor_logic_1.scanBlocks(blockQueue, saver, config, profiler)];
            }
        });
    });
}
exports.scanEthereumExplorerBlocks = scanEthereumExplorerBlocks;
