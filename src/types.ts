import { blockchain, BlockInfo, TransactionStatus } from "vineyard-blockchain"
import { BigNumber } from 'bignumber.js'

export interface BaseAddress<Identity> {
  id: Identity
  externalAddress: string
  balance: BigNumber
}

export interface BaseBlock {
  hash: string
  index: number
  timeMined: Date
}

export type TransactionDelegate = (transaction: blockchain.SingleTransaction) => Promise<blockchain.SingleTransaction>
export type TransactionCheck = (transaction: blockchain.SingleTransaction) => Promise<boolean>
export type TransactionSaver = (source: blockchain.SingleTransaction, block: BlockInfo) => Promise<blockchain.SingleTransaction | undefined>

export type TransactionQueryDelegate = (txid: string) => Promise<blockchain.SingleTransaction | undefined>

export type TransactionSaveDelegate = (transaction: blockchain.SingleTransaction) => Promise<void>

export type TransactionStatusDelegate = (transaction: blockchain.SingleTransaction, status: TransactionStatus) => Promise<blockchain.SingleTransaction>

export type PendingTransactionDelegate = (maxBlockIndex: number) => Promise<blockchain.SingleTransaction[]>

export type BlockGetter = () => Promise<BlockInfo | undefined>

export type LastBlockDelegate = (blockIndex: number) => Promise<BlockInfo | undefined>

export type BlockCurrencyDelegate = (block: BaseBlock) => Promise<void>

export type AddressIdentityDelegate<Identity> = (externalAddress: string) => Promise<Identity>

export interface BlockDao {
  saveBlock: BlockCurrencyDelegate
}

export interface LastBlockDao {
  getLastBlock: BlockGetter
  setLastBlock: LastBlockDelegate
}

export interface TransactionDao {
  getTransactionByTxid: TransactionQueryDelegate
  saveTransaction: TransactionSaveDelegate
  setStatus: TransactionStatusDelegate
}

export interface PendingTransactionDao {
  listPendingTransactions: PendingTransactionDelegate
}

export interface MonitorDao {
  blockDao: BlockDao
  lastBlockDao: LastBlockDao
  transactionDao: TransactionDao
}

export interface LastBlock {
  index?: number,
  currency: string
}
