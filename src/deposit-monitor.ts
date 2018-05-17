import {
  blockchain,
  ReadClient,
  Currency,
  NewBlock,
  FullBlock
} from 'vineyard-blockchain'
import { SingleTransactionBlockchainModel } from './deposit-monitor-manager'
import { ExternalTransaction, DepositTransaction, TransactionHandler, BaseBlock, BaseTransaction } from "./types";
import { LastBlock } from "./types";

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

  private convertStatus(highestBlock: number, source: ExternalTransaction) {
    return highestBlock - source.blockIndex >= this.minimumConfirmations
      ? blockchain.TransactionStatus.accepted
      : blockchain.TransactionStatus.pending
  }

  private async saveExternalTransaction(source: ExternalTransaction, blockIndex: number): Promise<DepositTransaction | undefined> {
    try {
      const existing = await this.model.getTransactionByTxid(source.txid)
      if (existing) {
        // handle uncle block stuff here
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
        status: this.convertStatus(blockIndex, source),
        amount: source.amount,
        timeReceived: source.timeReceived,
        blockIndex,
        currency: this.currency.id
      })

      this.transactionHandler.onSave(transaction as any)

      if (blockIndex - source.blockIndex >= this.minimumConfirmations) {
        return await this.transactionHandler.onConfirm(transaction as any)
      }
    }
    catch (error) {
      console.error('Error saving transaction', error, source)
      return undefined
    }
  }

  private async saveExternalTransactions(transactions: ExternalTransaction[], blockIndex: number): Promise<void> {
    for (let transaction of transactions) {
      if (await this.transactionHandler.shouldTrackTransaction(transaction)) {
        await this.saveExternalTransaction(transaction, blockIndex)
      }
    }
  }

  private async confirmExistingTransaction(transaction: DepositTransaction): Promise<DepositTransaction> {
    const ExternalTransaction = await this.model.setTransactionStatus(transaction, blockchain.TransactionStatus.accepted)
    return await this.transactionHandler.onConfirm(ExternalTransaction as any)
  }

  private async updatePendingTransaction(transaction: DepositTransaction): Promise<DepositTransaction> {
    const transactionFromDatabase = await this.model.getTransactionByTxid(transaction.txid)
    if (transactionFromDatabase && transactionFromDatabase.status == blockchain.TransactionStatus.pending)
      return await this.confirmExistingTransaction(transaction)

    return transaction
  }

  async scanBlocks(): Promise<void> {
    let lastBlock: LastBlock | undefined = await this.model.getLastBlock()
    do {
      const offsetAmount = lastBlock && !!(lastBlock.blockIndex + 1) ? lastBlock.blockIndex - this.minimumConfirmations : 0
      const offsetBlockIndex = offsetAmount > 0 ? offsetAmount : 0
      await this.gatherTransactions({ blockIndex: offsetBlockIndex})
      lastBlock = await this.gatherTransactions(lastBlock)
    } while (lastBlock)
  }

  async gatherTransactions(lastBlock: LastBlock | undefined): Promise<LastBlock | undefined> {
    const blockInfo = await this.client.getNextBlockInfo(lastBlock ? lastBlock.blockIndex : 0)
    if (!blockInfo)
      return undefined

    const fullBlock = await this.client.getFullBlock(blockInfo)
    if (!fullBlock) {
      console.error('Invalid block', blockInfo)
      return undefined
    }
    const block = {
      blockIndex: fullBlock.index,
      currency: this.currency.id
    }

    if (!fullBlock.transactions) {
      return block
    }

    await this.saveExternalTransactions(fullBlock.transactions, block.blockIndex)
    return this.model.setLastBlock(block)
  }

  async updatePendingTransactions(maxBlockIndex: number): Promise<void> {
    const transactions = await this.model.listPending(maxBlockIndex)
    for (let transaction of transactions) {
      try {
        await this.updatePendingTransaction(transaction)
      }
      catch (error) {
        console.error('Bitcoin Transaction Pending Error', error, transaction)
      }
    }
  }

  async update(): Promise<void> {
    const block = await this.client.getBlockIndex()
    await this.updatePendingTransactions(block - this.minimumConfirmations)
    await this.scanBlocks()
  }
}