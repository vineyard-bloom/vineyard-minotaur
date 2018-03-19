import {
  Currency,
  NewBlock,
  Block,
  NewTransaction,
  Transaction,
  TransactionStatus
} from 'vineyard-blockchain/src/types'
import { Collection } from 'vineyard-ground/source/collection'
import { Address } from './types'


export interface Scan {
  block: string
}

export interface DepositMonitorManagerModel {
  Address: Collection<Address>
  LastBlock: Collection<Block>
  Transaction: Collection<Transaction>
  ground: any
}

export class DepositMonitorManager {
  public model: DepositMonitorManagerModel
  public currency: Currency

  constructor(model: DepositMonitorManagerModel, currency: Currency) {
    this.model = model
    this.currency = currency
  }

  public async getTransactionByTxid(txid: string): Promise<Transaction | undefined> {
    return this.model.Transaction.first({ txid: txid, currency: this.currency.id }).exec()
  }

  public async saveTransaction(transaction: NewTransaction): Promise<Transaction> {
    return this.model.Transaction.create(transaction)
  }

  public async setTransactionStatus(transaction: Transaction, status: TransactionStatus): Promise<Transaction> {
    return this.model.Transaction.update(transaction, { status: status })
  }

  public async listPending(maxBlockIndex: number): Promise<Transaction[]> {
    const sql = `
    SELECT transactions.* FROM transactions
    JOIN blocks ON blocks.id = transactions.block
    AND blocks.index < :maxBlockIndex
    WHERE status = 0 AND transactions.currency = :currency`

    return this.model.ground.query(sql, {
      maxBlockIndex: maxBlockIndex,
      currency: this.currency.id
    })
  }

  public async getLastBlock(): Promise<Block | undefined> {
    const last = await this.model.LastBlock.first({ currency: this.currency.id }).exec()
    if (!last) {
      return last
    }
    return
  }

  public async setLastBlock(block: NewBlock) {
    const exists = await this.getLastBlock()
    if (exists) {
      await this.model.LastBlock.update({ currency: this.currency.id }, block)
    } else {
      await this.model.LastBlock.create(block)
    }
  }

  /*
  public async setLastBlockByHash(hash: string) {
    const block = await this.model.LastBlock.first({ hash: hash }).exec()
    return this.model.LastBlock.update({ block }, { currency: this.currency.id })
  }

  public async saveLastBlock(block: Block): Promise<Block> {
    return this.model.LastBlock.create(block)
  }
  */
}

export type SingleTransactionBlockchainModel = DepositMonitorManager
