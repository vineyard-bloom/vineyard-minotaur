import {
  Address,
  BaseBlock,
  BaseTransaction,
  BlockInfo,
  NewSingleTransaction,
  SingleTransaction as Transaction,
  TransactionStatus
} from "vineyard-blockchain"
import { Collection, Modeler } from 'vineyard-data/legacy'

export interface TransactionToSave extends NewSingleTransaction {
  status: TransactionStatus,
  currency: number
}

export interface Scan {
  block: string
}

export interface OldLastBlock {
  block?: BlockInfo,
  currency: string
}

export interface Model {
  Address: Collection<Address>
  Block: Collection<BlockInfo>
  Transaction: Collection<Transaction>
  LastBlock: Collection<OldLastBlock>

  ground: Modeler
}

export class DepositMonitorManager {
  model: Model

  constructor(model: Model) {
    this.model = model;
  }

  async getTransactionByTxid(txid: string, currency: number): Promise<Transaction | undefined> {
    return await this.model.Transaction.first(
      {
        txid: txid,
        currency: currency
      }).exec()
  }

  async saveTransaction(transaction: TransactionToSave): Promise<Transaction> {
    return await this.model.Transaction.create(transaction)
  }

  async setStatus(transaction: Transaction, status: TransactionStatus): Promise<Transaction> {
    return await this.model.Transaction.update(transaction, {
      status: status
    })
  }

  async listPending(currency: number, maxBlockIndex: number): Promise<Transaction[]> {
    const transactionsTable = (this.model.Transaction as any).trellis.table.name
    const sql = `
    SELECT ${transactionsTable}.* FROM ${transactionsTable}
    JOIN blocks ON blocks.id = ${transactionsTable}.block
    AND blocks.index < :maxBlockIndex
    WHERE status = 0 AND ${transactionsTable}.currency = :currency`

    return await this.model.ground.query(sql, {
      maxBlockIndex: maxBlockIndex,
      currency: currency
    })
  }

  async getLastBlock(currency: number): Promise<BlockInfo | undefined> {
    const last = await this.model.LastBlock.first({currency: currency}).exec()
    if (!last)
      return last

    return await this.model.Block.first({id: last.block}).exec()
  }

  async setLastBlock(block: string, currency: number) {
    const exists = await this.getLastBlock(currency)
    if (exists) {
      const sql = `UPDATE last_blocks SET block = :block WHERE currency = :currency`
      return await this.model.ground.query(sql, {
        block: block,
        currency: currency,
      })
    } else {
      await this.model.LastBlock.create({block: block, currency: currency})
    }
  }

  async setLastBlockByHash(hash: string, currency: number) {
    const block = await this.model.Block.first({hash: hash}).exec()
    return await this.model.LastBlock.update({block: block}, {currency: currency})
  }

  async saveBlock(block: BaseBlock): Promise<BlockInfo> {
    const filter = block.hash
      ? {currency: block.currency, hash: block.hash}
      : {currency: block.currency, index: block.index}

    const existing = await this.model.Block.first(filter)
    if (existing)
      return existing;

    return await this.model.Block.create(block)
  }

  async saveLastBlock(block: BaseBlock, currency: number): Promise<OldLastBlock> {
    let lastBlock: any
    lastBlock.block = block
    lastBlock.currency = currency
    return await this.model.LastBlock.create(lastBlock)
  }
}

export type SingleTransactionBlockchainManager = DepositMonitorManager
export type SingleTransactionBlockchainModel = DepositMonitorManager