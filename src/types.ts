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

export type TransactionQueryDelegateOld = (txid: string) => Promise<blockchain.SingleTransaction | undefined>

export type TransactionSaveDelegateOld = (transaction: blockchain.SingleTransaction) => Promise<void>

export type TransactionStatusDelegateOld = (transaction: blockchain.SingleTransaction, status: TransactionStatus) => Promise<blockchain.SingleTransaction>

export type TransactionQueryDelegate<Transaction> = (txid: string) => Promise<Transaction | undefined>

export type TransactionSaveDelegate<Transaction> = (transaction: Transaction) => Promise<void>

export type TransactionStatusDelegate<Transaction> = (transaction: Transaction, status: TransactionStatus) => Promise<Transaction>

export type PendingTransactionDelegate = (maxBlockIndex: number) => Promise<blockchain.SingleTransaction[]>

export type BlockGetterOld = () => Promise<BlockInfo | undefined>

export type BlockGetter = () => Promise<number | undefined>

export type LastBlockDelegate = (blockIndex: number) => Promise<BlockInfo | undefined>

export type BlockCurrencyDelegate = (block: BaseBlock) => Promise<void>

export type AddressIdentityDelegate<Identity> = (externalAddress: string) => Promise<Identity>

export interface BlockDao {
  saveBlock: BlockCurrencyDelegate
}

export interface LastBlockDaoOld {
  getLastBlock: BlockGetterOld
  setLastBlock: LastBlockDelegate
}

export interface LastBlockDao {
  getLastBlock: BlockGetter
  setLastBlock: LastBlockDelegate
}

export interface TransactionDaoOld {
  getTransactionByTxid: TransactionQueryDelegateOld
  saveTransaction: TransactionSaveDelegateOld
  setStatus: TransactionStatusDelegateOld
}

export interface TransactionDao<Transaction> {
  getTransactionByTxid: TransactionQueryDelegate<Transaction>
  saveTransaction: TransactionSaveDelegate<Transaction>
  setStatus: TransactionStatusDelegate<Transaction>
}

export interface PendingTransactionDao {
  listPendingTransactions: PendingTransactionDelegate
}

export interface MonitorDaoOld {
  blockDao: BlockDao
  lastBlockDao: LastBlockDaoOld
  transactionDao: TransactionDaoOld
}

export interface MonitorDao {
  blockDao: BlockDao
  lastBlockDao: LastBlockDao
}

export interface LastBlock {
  blockIndex?: number,
  currency: number
}

export interface Address {
  id: number
  address: string
}

export interface Currency {
  id: number
  address?: number
  name: string
}

export interface BaseTransaction extends blockchain.BaseTransaction {

}

export interface Block extends blockchain.Block {

}