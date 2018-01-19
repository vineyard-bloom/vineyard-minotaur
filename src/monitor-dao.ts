import {SingleTransaction as Transaction} from "vineyard-blockchain"
import {Collection} from "vineyard-ground/source/collection";
import {Model, TransactionToSave} from "./deposit-monitor-manager";
import {BaseBlock, BlockInfo, TransactionStatus} from "vineyard-blockchain/src/types";
import {Modeler} from "vineyard-ground/source/modeler";

export type TransactionQueryDelegate = (txid: string, currency: number) => Promise<Transaction | undefined>

export type TransactionSaveDelegate = (transaction: TransactionToSave) => Promise<Transaction>

export type TransactionStatusDelegate = (transaction: Transaction, status: TransactionStatus) => Promise<Transaction>

export type PendingTransactionDelegate = (currency: number, maxBlockIndex: number) => Promise<Transaction[]>

export type CurrencyDelegate = (currency: number) => Promise<BlockInfo | undefined>

export type LastBlockDelegate = (block: string, currency: number) => Promise<BlockInfo | undefined>

export type BlockCurrencyDelegate = (block: BaseBlock) => Promise<BlockInfo>

export interface MonitorDao {
  getTransactionByTxid: TransactionQueryDelegate
  saveTransaction: TransactionSaveDelegate
  setStatus: TransactionStatusDelegate
  listPendingTransactions: PendingTransactionDelegate
  getLastBlock: CurrencyDelegate
  setLastBlock: LastBlockDelegate
  saveBlock: BlockCurrencyDelegate
}

async function getTransactionByTxid(transactionCollection: Collection<Transaction>, txid: string,
                                    currency: number): Promise<Transaction | undefined> {
  return await transactionCollection.first(
    {
      txid: txid,
      currency: currency
    }).exec()
}

async function saveTransaction(transactionCollection: Collection<Transaction>,
                               transaction: TransactionToSave): Promise<Transaction> {
  return await transactionCollection.create(transaction)
}

async function setStatus(transactionCollection: Collection<Transaction>, transaction: Transaction,
                         status: TransactionStatus): Promise<Transaction> {
  return await transactionCollection.update(transaction, {
    status: status
  })
}

async function listPendingTransactions(ground: Modeler, transactionCollection: Collection<Transaction>,
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

async function getLastBlock(ground: Modeler, currency: number): Promise<BlockInfo | undefined> {
  const sql = `
  SELECT * FROM blocks
  JOIN last_blocks ON lastblocks.block = blocks.id
  `
  return ground.querySingle(sql)
}

async function setLastBlock(ground: Modeler, block: string, currency: number) {
  const sql = `UPDATE last_blocks SET block = :block WHERE currency = :currency`
  return await ground.query(sql, {
    block: block,
    currency: currency,
  })
}

async function saveBlock(blockCollection: Collection<BlockInfo>, block: BaseBlock): Promise<BlockInfo> {
  const filter = block.hash
    ? {currency: block.currency, hash: block.hash}
    : {currency: block.currency, index: block.index}

  const existing = await blockCollection.first(filter)
  if (existing)
    return existing;

  return await blockCollection.create(block)
}

export function createMonitorDao(model: Model): MonitorDao {
  const ground = model.ground
  return {
    getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
    saveTransaction: saveTransaction.bind(null, model.Transaction),
    setStatus: setStatus.bind(null, model.Transaction),
    listPendingTransactions: listPendingTransactions.bind(null, ground),
    getLastBlock: getLastBlock.bind(null, ground),
    setLastBlock: setLastBlock.bind(null, ground),
    saveBlock: saveBlock.bind(null, model.Block)

  }
}