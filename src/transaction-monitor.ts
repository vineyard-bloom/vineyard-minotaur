import {ExternalTransaction, Transaction, TransactionStatus, ReadClient, Currency, Block} from 'vineyard-blockchain'
import {BlockchainModel} from "./blockchain-model";

export class TransactionMonitor {
  private model: BlockchainModel
  private client: ReadClient
  private currency: Currency
  private minimumConfirmations: number

  constructor(model: BlockchainModel, client: ReadClient, currency: Currency, minimumConfirmations: number) {
    this.model = model;
    this.client = client;
    this.currency = currency;
    this.minimumConfirmations = minimumConfirmations;
  }

  private convertStatus(source: ExternalTransaction) {
    return source.confirmations >= this.minimumConfirmations
      ? TransactionStatus.accepted
      : TransactionStatus.pending
  }

  private async saveExternalTransaction(source: ExternalTransaction, block: Block): Promise<Transaction | undefined> {
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
        return await this.model.onConfirm(transaction)
      }
    }
    catch (error) {
      console.error('Error saving transaction', error, source)
      return undefined
    }
  }

  private async saveExternalTransactions(transactions: ExternalTransaction [], block: Block): Promise<void> {
    for (let transaction of transactions) {
      await this.saveExternalTransaction(transaction, block)
    }
  }

  private async confirmExistingTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.status = TransactionStatus.accepted
    const ExternalTransaction = await this.model.setStatus(transaction, TransactionStatus.accepted)
    return await this.model.onConfirm(ExternalTransaction)
  }

  private async updatePendingTransaction(transaction: Transaction): Promise<Transaction> {
    const source = await this.client.getTransaction(transaction.txid)
    return source.confirmations >= this.minimumConfirmations
      ? await this.confirmExistingTransaction(transaction)
      : transaction
  }

  async gatherTransactions(currency: string): Promise<Transaction[]> {
    const lastBlock = await this.model.getLastBlock(currency)
    const blocklist = await this.client.getNextFullBlock(lastBlock)
    if (!blocklist)
      return []

    const block = await this.model.saveBlock({
      hash: blocklist.hash,
      index: blocklist.index,
      timeMined: blocklist.timeMined,
      currency: this.currency.id
    })

    if (blocklist.transactions.length == 0)
      return []

    await this.saveExternalTransactions(blocklist.transactions, block)

    return blocklist.lastBlock
      ? await this.model.setLastBlockByHash(blocklist.lastBlock, currency)
        .then(() => [])
      : Promise.resolve([])
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
      .then(() => this.gatherExternalTransactions())
  }
}