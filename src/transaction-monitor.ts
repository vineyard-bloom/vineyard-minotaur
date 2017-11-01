import {ExternalTransaction, Transaction, TransactionStatus, ReadClient, Currency, FullBlock, BlockInfo} from 'vineyard-blockchain'
import {BlockchainModel} from "./blockchain-model";
import {TransactionHandler} from "./types"

export class TransactionMonitor {
  private model: BlockchainModel
  private client: ReadClient
  private currency: Currency
  private minimumConfirmations: number
  private transactionHandler: TransactionHandler

  constructor(model: BlockchainModel, client: ReadClient, currency: Currency, minimumConfirmations: number, transactionHandler: TransactionHandler) {
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

  private async saveExternalTransaction(source: ExternalTransaction, block: BlockInfo): Promise<Transaction | undefined> {
    try {
      const existing = await this.model.getTransactionByTxid(source.txid, this.currency.id)
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
        block: block.id
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

  private async saveExternalTransactions(transactions: ExternalTransaction [], block: BlockInfo): Promise<void> {
    for (let transaction of transactions) {
      if(this.transactionHandler.shouldTrackTransaction(transaction)) {
        await this.saveExternalTransaction(transaction, block)
      }
    }
  }

  private async confirmExistingTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.status = TransactionStatus.accepted
    const ExternalTransaction = await this.model.setStatus(transaction, TransactionStatus.accepted)
    return await this.transactionHandler.onConfirm(ExternalTransaction)
  }

  private async updatePendingTransaction(transaction: Transaction): Promise<Transaction> {
    const source = await this.client.getTransaction(transaction.txid)
    return source.confirmations >= this.minimumConfirmations
      ? await this.confirmExistingTransaction(transaction)
      : transaction
  }

  async gatherTransactions(currency: string): Promise<void> {
    const lastBlock = await this.model.getLastBlock(currency)
    const blockInfo: BlockInfo = await this.client.getNextBlockInfo(lastBlock)
    if (!blockInfo)
      return 
    const fullBlock: FullBlock = await this.client.getFullBlock(blockInfo)
    const block = await this.model.saveBlock({
      hash: fullBlock.hash,
      index: fullBlock.index,
      timeMined: fullBlock.timeMined,
      currency: this.currency.id
    })

    if (fullBlock.transactions.length == 0)
      return 

    await this.saveExternalTransactions(fullBlock.transactions, block)

    await this.model.setLastBlock(block.id, currency)
   
  }

  async updatePendingTransactions(): Promise<any> {
    const transactions = await this.model.listPending(this.currency.id)
    for (let transaction of transactions) {
      try {
        await this.updatePendingTransaction(transaction)
      }
      catch (error) {
        console.error('Bitcoin Transaction Pending Error', error, transaction)
      }
    }
  }

  update(): Promise<any> {
    return this.updatePendingTransactions()
      .then(() => this.gatherTransactions(this.currency.name))
  }
}