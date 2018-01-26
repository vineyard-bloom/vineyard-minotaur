import {SingleTransaction as Transaction} from "vineyard-blockchain"
import {Collection} from "vineyard-ground/source/collection";
import {Model, TransactionToSave} from "./deposit-monitor-manager";
import {BaseBlock, BlockInfo, TransactionStatus} from "vineyard-blockchain/src/types";
import {Modeler} from "vineyard-ground/source/modeler";
import {BlockDao, LastBlockDao, MonitorDao, TransactionDao} from "./types";

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

export async function setLastBlock(ground: Modeler, block: string, currency: number) {
  const sql = `UPDATE last_blocks SET block = :block WHERE currency = :currency`
  return await ground.query(sql, {
    block: block,
    currency: currency,
  })
}

export async function saveBlock(blockCollection: Collection<BlockInfo>, block: BaseBlock): Promise<BlockInfo> {
  const filter = block.hash
    ? {currency: block.currency, hash: block.hash}
    : {currency: block.currency, index: block.index}

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

export function createLastBlockDao(model: Model): LastBlockDao {
  const ground = model.ground
  return {
    getLastBlock: getLastBlock.bind(null, ground),
    setLastBlock: setLastBlock.bind(null, ground)
  }
}

export function createTransactionDao(model: Model): TransactionDao {
  const ground = model.ground
  return {
    getTransactionByTxid: getTransactionByTxidAndCurrency.bind(null, model.Transaction),
    saveTransaction: saveTransaction.bind(null, model.Transaction),
    setStatus: setStatus.bind(null, model.Transaction),
    listPendingTransactions: listPendingTransactions.bind(null, ground),
  }
}

export function createMonitorDao(model: Model): MonitorDao {
  return {
    blockDao: createBlockDao(model),
    lastBlockDao: createLastBlockDao(model),
    transactionDao: createTransactionDao(model)
  }
}