import {
  ExternalSingleTransaction as ExternalTransaction,
  Transaction,
  TransactionStatus,
  ReadClient,
  Currency,
  NewBlock,
  FullBlock,
  Block
} from 'vineyard-blockchain'
import { SingleTransactionBlockchainModel } from './deposit-monitor-manager'
import { TransactionHandler } from './types'

export class DepositMonitor {
  private model: SingleTransactionBlockchainModel
  private client: ReadClient<ExternalTransaction>
  private currency: Currency
  private minimumConfirmations: number
  private transactionHandler: TransactionHandler

  constructor(model: SingleTransactionBlockchainModel, client: ReadClient<ExternalTransaction>, currency: Currency, minimumConfirmations: number, transactionHandler: TransactionHandler) {
    this.model = model;
    this.client = client;
    this.currency = currency;
    this.minimumConfirmations = minimumConfirmations;
    this.transactionHandler = transactionHandler;
  }

  private convertStatus(source: ExternalTransaction) {
    return source.confirmations >= this.minimumConfirmations
      ? TransactionStatus.accepted
      : TransactionStatus.pending
  }

  private async saveExternalTransaction(source: ExternalTransaction, block: Block): Promise<Transaction | undefined> {
    try {
      const existing = await this.model.getTransactionByTxid(source.txid)
      if (existing) {
        return existing
      }
    }
    catch (error) {
      console.error('Error checking for existing transaction', error, source)
      return undefined
    }

    try {
      const transaction = await this.model.saveTransaction({
        txid: source.txid,
        to: source.to,
        from: source.from,
        status: this.convertStatus(source),
        amount: source.amount,
        timeReceived: source.timeReceived,
        block: block.id,
        currency: this.currency.id 
      })

      if (source.confirmations >= this.minimumConfirmations) {
        return await this.transactionHandler.onConfirm(transaction)
      }
    }
    catch (error) {
      console.error('Error saving transaction', error, source)
      return undefined
    }
  }

  private async saveExternalTransactions(transactions: ExternalTransaction[], block: Block): Promise<void> {
    for (let transaction of transactions) {
      if (await this.transactionHandler.shouldTrackTransaction(transaction)) {
        await this.saveExternalTransaction(transaction, block)
      }
    }
  }

  private async confirmExistingTransaction(transaction: Transaction): Promise<Transaction> {
    const ExternalTransaction = await this.model.setStatus(transaction, TransactionStatus.accepted)
    return await this.transactionHandler.onConfirm(ExternalTransaction)
  }

  private async updatePendingTransaction(transaction: Transaction): Promise<Transaction> {
    const transactionFromDatabase = await this.model.getTransactionByTxid(transaction.txid)
    if (transactionFromDatabase && transactionFromDatabase.status == TransactionStatus.pending)
      return await this.confirmExistingTransaction(transaction)

    return transaction
  }

  async scanBlocks() {
    let lastBlock = await this.model.getLastBlock()
    do {
      lastBlock = await this.gatherTransactions(lastBlock)
    } while (lastBlock)
  }

  async gatherTransactions(lastBlock: Block | undefined): Promise<NewBlock | undefined> {

    const blockInfo = await this.client.getNextBlockInfo(lastBlock)
    if (!blockInfo)
      return

    const fullBlock = await this.client.getFullBlock(blockInfo)
    if (!fullBlock) {
      console.error('Invalid block', blockInfo)
      return undefined
    }
    const block = {
      hash: fullBlock.hash,
      index: fullBlock.index,
      timeMined: fullBlock.timeMined,
      currency: this.currency.id
    }

    if (!fullBlock.transactions) {
      return block
    }
    await this.saveExternalTransactions(fullBlock.transactions, block)

    await this.model.setLastBlock(block)

    return block
  }

  async updatePendingTransactions(maxBlockIndex: number): Promise<any> {
    const transactions = await this.model.listPending(this.currency.id, maxBlockIndex)
    for (let transaction of transactions) {
      try {
        await this.updatePendingTransaction(transaction)
      }
      catch (error) {
        console.error('Bitcoin Transaction Pending Error', error, transaction)
      }
    }
  }

  async update(): Promise<any> {
    const block = await this.client.getBlockIndex()
    await this.updatePendingTransactions(block - this.minimumConfirmations)
    await this.scanBlocks()
  }
}