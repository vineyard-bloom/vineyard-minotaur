"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function saveSingleCurrencyBlock(blockCollection, block) {
    const existing = await blockCollection.first({ index: block.index });
    if (existing)
        return;
    await blockCollection.create(block);
}
exports.saveSingleCurrencyBlock = saveSingleCurrencyBlock;
function getTransactionByTxid(transactionCollection, txid) {
    return transactionCollection.first({ txid: txid }).exec();
}
exports.getTransactionByTxid = getTransactionByTxid;
//# sourceMappingURL=explorer-helpers.js.map