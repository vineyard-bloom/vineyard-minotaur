import {Address, BaseBlock, BaseTransaction, Block, Transaction, TransactionStatus} from "vineyard-blockchain"
import {Collection, Modeler} from "vineyard-ground"

export interface TransactionToSave extends BaseTransaction {
  status: TransactionStatus
}

export type ConfirmationHandler = (transaction: Transaction) => Promise<Transaction>

export const emptyConfirmationHandler: ConfirmationHandler = t => Promise.resolve(t)

export interface LastBlock {
  block: string,
  currency: string
}

export interface Scan {
  block: string
}

export interface Model {
  Address: Collection<Address>
  Block: Collection<Block>
  Transaction: Collection<Transaction>
  LastBlock: Collection<LastBlock>
  Scan: Collection<Scan>

  ground: Modeler
}

export class BlockchainModel {
  model: Model
  confirmationHandler: ConfirmationHandler

  constructor(model: Model, confirmationHandler: ConfirmationHandler = emptyConfirmationHandler) {
    this.model = model;
    this.confirmationHandler = confirmationHandler;
  }

  async getTransactionByTxid(txid: string, currency: string): Promise<Transaction | undefined> {
    return await this.model.Transaction.first(
      {
        txid: txid,
        currency: currency
      }).exec()
  }

  async saveTransaction(transaction: TransactionToSave): Promise<Transaction> {
    return await this.model.Transaction.create(transaction)
  }

  async onConfirm(transaction: Transaction): Promise<Transaction> {
    return await this.confirmationHandler(transaction)
  }

  async setStatus(transaction: Transaction, status: TransactionStatus): Promise<Transaction> {
    return await this.model.Transaction.update(transaction, {
      status: status
    })
  }

  async listPending(currency: string): Promise<Transaction[]> {
    return await this.model.Transaction.filter({
      status: TransactionStatus.pending,
      currency: currency
    }).exec()
  }

  async getLastBlock(currency: string): Promise<Block | undefined> {
    const last = await this.model.LastBlock.first({currency: currency}).exec()
    if (!last)
      return last

    return await this.model.Block.first({id: last.block}).exec()
  }

  async setLastBlock(block: string, currency: string) {
    return await this.model.LastBlock.update({block: block}, {currency: currency})
  }

  async setLastBlockByHash(hash: string, currency: string) {
    const block = await this.model.Block.first({hash: hash}).exec()
    return await this.model.LastBlock.update({block: block}, {currency: currency})
  }

  async saveBlock(block: BaseBlock): Promise<Block> {
    return await this.model.Block.create(block)
  }
}