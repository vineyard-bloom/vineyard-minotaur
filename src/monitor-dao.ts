import { BaseBlock, BlockInfo, SingleTransaction as Transaction, TransactionStatus } from 'vineyard-blockchain'
import { Collection, Modeler } from 'vineyard-data/legacy'
import { Model, TransactionToSave } from './deposit-monitor-manager'
import { BlockDao, LastBlockDao, LastBlockDaoOld, MonitorDaoOld, TransactionDaoOld } from './types'

export async function getTransactionByTxidAndCurrency(transactionCollection: Collection<Transaction>, txid: string,
                                                      currency: number): Promise<Transaction | undefined> {
  return await transactionCollection.first(
    {
      txid: txid,
      currency: currency
    }).exec()
}

export async function saveTransaction(transactionCollection: Collection<Transaction>,
                                      transaction: TransactionToSave): Promise<Transaction> {
  return await transactionCollection.create(transaction)
}

export async function setStatus(transactionCollection: Collection<Transaction>, transaction: Transaction,
                                status: TransactionStatus): Promise<Transaction> {
  return await transactionCollection.update(transaction, {
    status: status
  })
}

export async function listPendingTransactions(ground: Modeler, transactionCollection: Collection<Transaction>,
                                              currency: number, maxBlockIndex: number): Promise<Transaction[]> {
  const sql = `
    SELECT transactions.* FROM transactions
    JOIN blocks ON blocks.id = transactions.block
    AND blocks.index < :maxBlockIndex
    WHERE status = 0 AND transactions.currency = :currency`

  return await ground.query(sql, {
    maxBlockIndex: maxBlockIndex,
    currency: currency
  })
}

export async function getLastBlock(ground: Modeler, currency: number): Promise<BlockInfo | undefined> {
  const sql = `
  SELECT * FROM blocks
  JOIN last_blocks ON last_blocks.block = blocks.id
  `
  return ground.querySingle(sql)
}

export async function setLastBlock(ground: Modeler, currency: number, blockIndex: number) {
  const sql = `
  UPDATE last_blocks 
  SET "blockIndex" = :blockIndex 
  WHERE currency = :currency
  `
  return await ground.query(sql, {
    blockIndex: blockIndex,
    currency: currency,
  })
}

export function getLastBlockIndex(ground: Modeler, currency: number): Promise<number | undefined> {
  const sql = `
  SELECT "blockIndex" FROM last_blocks WHERE currency = :currency
  `
  return ground.querySingle(sql, { currency: currency })
    .then((value: any) =>
      (value && typeof value.blockIndex == 'string') ? parseInt(value.blockIndex) : undefined
    )
}

export async function setLastBlockIndex(ground: Modeler, currency: number, block: number) {
  const sql = `UPDATE last_blocks SET "blockIndex" = :block WHERE currency = :currency`
  return await ground.query(sql, {
    block: block,
    currency: currency,
  })
}

export async function saveBlock(blockCollection: Collection<BlockInfo>, block: BaseBlock): Promise<BlockInfo> {
  const filter = block.hash
    ? { currency: block.currency, hash: block.hash }
    : { currency: block.currency, index: block.index }

  const existing = await blockCollection.first(filter)
  if (existing)
    return existing

  return await blockCollection.create(block)
}

export function createBlockDao(model: Model): BlockDao {
  return {
    saveBlock: saveBlock.bind(null, model.Block)
  }
}

export function createIndexedLastBlockDao(ground: Modeler, currency: number): LastBlockDao {
  return {
    getLastBlock: () => getLastBlockIndex(ground, currency),
    setLastBlock: (blockIndex: number) => setLastBlockIndex(ground, currency, blockIndex)
  }
}

export function createLastBlockDao(ground: Modeler): LastBlockDaoOld {
  return {
    getLastBlock: getLastBlock.bind(null, ground, 1),
    setLastBlock: setLastBlock.bind(null, ground, 1)
  }
}

export function createTransactionDao(model: Model): TransactionDaoOld {
  const ground = model.ground
  return {
    getTransactionByTxid: getTransactionByTxidAndCurrency.bind(null, model.Transaction),
    saveTransaction: saveTransaction.bind(null, model.Transaction),
    setStatus: setStatus.bind(null, model.Transaction),
    // listPendingTransactions: listPendingTransactions.bind(null, ground),
  }
}

export function createMonitorDao(model: Model): MonitorDaoOld {
  return {
    blockDao: createBlockDao(model),
    lastBlockDao: createLastBlockDao(model.ground),
    transactionDao: createTransactionDao(model)
  }
}