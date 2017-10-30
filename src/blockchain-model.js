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
const vineyard_blockchain_1 = require("vineyard-blockchain");
exports.emptyConfirmationHandler = t => Promise.resolve(t);
class BlockchainModel {
    constructor(model, confirmationHandler = exports.emptyConfirmationHandler) {
        this.model = model;
        this.confirmationHandler = confirmationHandler;
    }
    getTransactionByTxid(txid, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.Transaction.first({
                txid: txid,
                currency: currency
            }).exec();
        });
    }
    saveTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.Transaction.create(transaction);
        });
    }
    onConfirm(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.confirmationHandler(transaction);
        });
    }
    setStatus(transaction, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.Transaction.update(transaction, {
                status: status
            });
        });
    }
    listPending(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.Transaction.filter({
                status: vineyard_blockchain_1.TransactionStatus.pending,
                currency: currency
            }).exec();
        });
    }
    getLastBlock(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const last = yield this.model.LastBlock.first({ currency: currency }).exec();
            if (!last)
                return last;
            return yield this.model.Block.first({ id: last.block }).exec();
        });
    }
    setLastBlock(block, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.LastBlock.update({ block: block }, { currency: currency });
        });
    }
    setLastBlockByHash(hash, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield this.model.Block.first({ hash: hash }).exec();
            return yield this.model.LastBlock.update({ block: block }, { currency: currency });
        });
    }
    saveBlock(block) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.Block.create(block);
        });
    }
}
exports.BlockchainModel = BlockchainModel;
//# sourceMappingURL=blockchain-model.js.map