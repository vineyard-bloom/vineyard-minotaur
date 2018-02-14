import {
  blockchain
} from "vineyard-blockchain"
import { MonitorDaoOld, TransactionCheck, TransactionDaoOld, TransactionDelegate, TransactionSaver } from "./types"

// function convertStatus(minimumConfirmations: number, source: blockchain.SingleTransaction) {
//   return source.confirmations >= minimumConfirmations
//     ? blockchain.TransactionStatus.accepted
//     : blockchain.TransactionStatus.pending
// }

// async function saveExternalTransaction(dao: TransactionDao, currency: number,
//                                        onConfirm: TransactionDelegate,
//                                        minimumConfirmations: number,
//                                        source: blockchain.SingleTransaction,
//                                        block: BlockInfo): Promise<blockchain.SingleTransaction | undefined> {
//   try {
//     const existing = await dao.getTransactionByTxid(source.txid)
//     if (existing) {
//       return existing
//     }
//   }
//   catch (error) {
//     console.error('Error checking for existing transaction', error, source)
//     return undefined
//   }
//
//   try {
//     const transaction = await dao.saveTransaction({
//       txid: source.txid,
//       to: source.to,
//       from: source.from,
//       status: convertStatus(minimumConfirmations, source),
//       amount: source.amount,
//       timeReceived: source.timeReceived,
//       block: block.id,
//       currency: currency
//     })
//
//     if (source.confirmations >= minimumConfirmations) {
//       return await onConfirm(transaction)
//     }
//   }
//   catch (error) {
//     console.error('Error saving transaction', error, source)
//     return undefined
//   }
// }

// export async function listPendingSingleCurrencyTransactions(ground: Modeler,
//                                                             maxBlockIndex: number): Promise<blockchain.SingleTransaction[]> {
//   const sql = `
//     SELECT transactions.* FROM transactions
//     JOIN blocks ON blocks.id = transactions.block
//     AND blocks.index < :maxBlockIndex
//     WHERE status = 0`
//
//   return await ground.query(sql, {
//     maxBlockIndex: maxBlockIndex
//   })
// }

async function confirmExistingTransaction(dao: MonitorDaoOld, transaction: blockchain.SingleTransaction):
Promise<blockchain.SingleTransaction> {
  transaction.status = blockchain.TransactionStatus.accepted
  return await dao.transactionDao.setStatus(transaction, blockchain.TransactionStatus.accepted)
}

async function isReadyToConfirm(dao: MonitorDaoOld, transaction: blockchain.SingleTransaction): Promise<boolean> {
  const transactionFromDatabase = await dao.transactionDao.getTransactionByTxid(transaction.txid)
  return !!transactionFromDatabase && transactionFromDatabase.status == blockchain.TransactionStatus.pending
}

// async function gatherTransactions(dao: MonitorDao, shouldTrackTransaction: TransactionCheck,
//                                   saveTransaction: TransactionSaver,
//                                   client: blockchain.ReadClient<blockchain.SingleTransaction>,
//                                   currency: number,
//                                   lastBlock: blockchain.Block | undefined): Promise<blockchain.BlockInfo | undefined> {
//
//   const blockInfo = await client.getNextBlockInfo(lastBlock)
//   if (!blockInfo)
//     return
//
//   const fullBlock = await
//     client.getFullBlock(blockInfo)
//   if (!fullBlock) {
//     console.error('Invalid block', blockInfo)
//     return undefined
//   }
//   const block = await
//     dao.blockDao.saveBlock({
//       hash: fullBlock.hash,
//       index: fullBlock.index,
//       timeMined: fullBlock.timeMined,
//       currency: currency
//     })
//   if (!fullBlock.transactions) {
//     return block
//   }
//
//   for (let transaction of fullBlock.transactions) {
//     if (await shouldTrackTransaction(transaction)
//     ) {
//       await
//         saveTransaction(transaction, block)
//     }
//   }
//
//   await
//     dao.lastBlockDao.setLastBlock(block.id)
//
//   return block
// }
//
// async function updatePendingTransactions(dao: MonitorDao, onConfirm: TransactionDelegate, currency: number,
//                                          maxBlockIndex: number): Promise<any> {
//   const transactions = await dao.transactionDao.listPendingTransactions(maxBlockIndex)
//   for (let transaction of transactions) {
//     try {
//       if (await isReadyToConfirm(dao, transaction)) {
//         const ExternalTransaction = await confirmExistingTransaction(dao, transaction)
//         await onConfirm(ExternalTransaction)
//       }
//     }
//     catch (error) {
//       console.error('Bitcoin Transaction Pending Error', error, transaction)
//     }
//   }
// }
//
// export async function scanBlocksStandard(dao: MonitorDao, client: blockchain.ReadClient<blockchain.SingleTransaction>,
//                       shouldTrackTransaction: TransactionCheck, onConfirm: TransactionDelegate,
//                       minimumConfirmations: number, currency: number): Promise<any> {
//   const block = await client.getBlockIndex()
//   await updatePendingTransactions(dao, onConfirm, currency, block - minimumConfirmations)
//   const saveTransaction = saveExternalTransaction.bind(null,
//     dao.transactionDao, currency, onConfirm, minimumConfirmations)
//   let lastBlock = await dao.lastBlockDao.getLastBlock()
//   do {
//     lastBlock = await gatherTransactions(dao, shouldTrackTransaction, saveTransaction, client, currency, lastBlock)
//   } while (lastBlock)
// }