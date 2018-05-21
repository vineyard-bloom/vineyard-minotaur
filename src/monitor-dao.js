"use strict";
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
async function setStatus(transactionCollection, transaction, status) {
    return await transactionCollection.update(transaction, {
        status: status
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
    const sql = `
  SELECT "blockIndex" FROM last_blocks WHERE currency = :currency
  `;
    return ground.querySingle(sql, { currency: currency })
        .then((value) => (value && typeof value.blockIndex == 'string') ? parseInt(value.blockIndex) : undefined);
}
exports.getLastBlockIndex = getLastBlockIndex;
async function setLastBlockIndex(ground, currency, block) {
    const sql = `UPDATE last_blocks SET "blockIndex" = :block WHERE currency = :currency`;
    return await ground.query(sql, {
        block: block,
        currency: currency,
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
        getLastBlock: () => getLastBlockIndex(ground, currency),
        setLastBlock: (blockIndex) => setLastBlockIndex(ground, currency, blockIndex)
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
//# sourceMappingURL=monitor-dao.js.map