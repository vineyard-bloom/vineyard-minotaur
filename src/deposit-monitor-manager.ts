import { Collection } from 'vineyard-ground'
import { blockchain } from "vineyard-blockchain"
import { BaseTransaction, Currency, LastBlock } from "./types";

export interface DepositMonitorManagerModel {
  LastBlock: Collection<LastBlock>
  Transaction: Collection<BaseTransaction>
  ground: any
}

export class DepositMonitorManager {
  public model: DepositMonitorManagerModel
  public currency: Currency

  constructor(model: DepositMonitorManagerModel, currency: Currency) {
    this.model = model
    this.currency = currency
  }

  public async getTransactionByTxid(txid: string): Promise<BaseTransaction | undefined> {
    return this.model.Transaction.first({ txid: txid, currency: this.currency.id }).exec()
  }

  public async saveTransaction(transaction: BaseTransaction): Promise<BaseTransaction> {
    return this.model.Transaction.create(transaction)
  }

  public async setTransactionStatus(transaction: BaseTransaction, status: blockchain.TransactionStatus): Promise<BaseTransaction> {
    return this.model.Transaction.update(transaction, { status: status })
  }

  public async listPending(maxBlockIndex: number): Promise<BaseTransaction[]> {
    const sql = `
    SELECT transactions.* FROM transactions
    WHERE status = 0 
    AND transactions.currency = :currency
    AND transactions.index < :maxBlockIndex`

    return this.model.ground.query(sql, {
      maxBlockIndex: maxBlockIndex,
      currency: this.currency.id
    })
  }

  public async getLastBlock(): Promise<LastBlock | undefined> {
    const last = await this.model.LastBlock.first({ currency: this.currency.id }).exec()
    if (!last) {
      return
    }
    return last
  }

  public async setLastBlock(block: LastBlock) {
    const currentLastBlock = await this.getLastBlock()
    if (currentLastBlock) {
      return await this.model.LastBlock.update(currentLastBlock.blockIndex, block)
    } else {
      return await this.model.LastBlock.create(block)
    }
  }
}

export type SingleTransactionBlockchainModel = DepositMonitorManager