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
// export async function getTransactionByTxidAndCurrency(transactionCollection: Collection<Transaction>, txid: string,
//                                                       currency: number): Promise<Transaction | undefined> {
//   return await transactionCollection.first(
//     {
//       txid: txid,
//       currency: currency
//     }).exec()
// }
//
// export async function saveTransaction(transactionCollection: Collection<Transaction>,
//                                       transaction: TransactionToSave): Promise<Transaction> {
//   return await transactionCollection.create(transaction)
// }
function setStatus(transactionCollection, transaction, status) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, transactionCollection.update(transaction, {
                        status: status
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.setStatus = setStatus;
//
// export async function listPendingTransactions(ground: Modeler, transactionCollection: Collection<Transaction>,
//                                               currency: number, maxBlockIndex: number): Promise<Transaction[]> {
//   const sql = `
//     SELECT transactions.* FROM transactions
//     JOIN blocks ON blocks.id = transactions.block
//     AND blocks.index < :maxBlockIndex
//     WHERE status = 0 AND transactions.currency = :currency`
//
//   return await ground.query(sql, {
//     maxBlockIndex: maxBlockIndex,
//     currency: currency
//   })
// }
//
// export async function getLastBlock(ground: Modeler, currency: number): Promise<BlockInfo | undefined> {
//   const sql = `
//   SELECT * FROM blocks
//   JOIN last_blocks ON last_blocks.block = blocks.id
//   `
//   return ground.querySingle(sql)
// }
//
// export async function setLastBlock(ground: Modeler, currency: number, blockIndex: number) {
//   const sql = `
//   UPDATE last_blocks
//   SET "blockIndex" = :blockIndex
//   WHERE currency = :currency
//   `
//   return await ground.query(sql, {
//     blockIndex: blockIndex,
//     currency: currency,
//   })
// }
function getLastBlockIndex(ground, currency) {
    var sql = "\n  SELECT \"blockIndex\" FROM last_blocks WHERE currency = :currency\n  ";
    return ground.querySingle(sql, { currency: currency })
        .then(function (value) {
        return (value && typeof value.blockIndex == 'string') ? parseInt(value.blockIndex) : undefined;
    });
}
exports.getLastBlockIndex = getLastBlockIndex;
function setLastBlockIndex(ground, currency, block) {
    return __awaiter(this, void 0, void 0, function () {
        var sql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sql = "UPDATE last_blocks SET \"blockIndex\" = :block WHERE currency = :currency";
                    return [4 /*yield*/, ground.query(sql, {
                            block: block,
                            currency: currency,
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.setLastBlockIndex = setLastBlockIndex;
//
// export async function saveBlock(blockCollection: Collection<BlockInfo>, currency: number, block: BaseBlock): Promise<BlockInfo> {
//   const filter = block.hash
//     ? { currency: currency, hash: block.hash }
//     : { currency: currency, index: block.index }
//
//   const existing = await blockCollection.first(filter)
//   if (existing)
//     return existing
//
//   return await blockCollection.create(block)
// }
//
// export function createBlockDao(model: Model, currency: number): BlockDao {
//   return {
//     saveBlock: saveBlock.bind(null, model.Block, currency)
//   }
// }
function createIndexedLastBlockDao(ground, currency) {
    return {
        getLastBlock: function () { return getLastBlockIndex(ground, currency); },
        setLastBlock: function (blockIndex) { return setLastBlockIndex(ground, currency, blockIndex); }
    };
}
exports.createIndexedLastBlockDao = createIndexedLastBlockDao;
//
// export function createLastBlockDao(ground: Modeler): LastBlockDaoOld {
//   return {
//     getLastBlock: getLastBlock.bind(null, ground, 1),
//     setLastBlock: setLastBlock.bind(null, ground, 1)
//   }
// }
// export function createTransactionDao(model: Model): TransactionDaoOld {
//   const ground = model.ground
//   return {
//     getTransactionByTxid: getTransactionByTxidAndCurrency.bind(null, model.Transaction),
//     saveTransaction: saveTransaction.bind(null, model.Transaction),
//     setStatus: setStatus.bind(null, model.Transaction),
//     // listPendingTransactions: listPendingTransactions.bind(null, ground),
//   }
// }
//
// export function createMonitorDao(model: Model, currency: number): MonitorDaoOld {
//   return {
//     blockDao: createBlockDao(model, currency),
//     lastBlockDao: createLastBlockDao(model.ground),
//     transactionDao: createTransactionDao(model)
//   }
// } 
