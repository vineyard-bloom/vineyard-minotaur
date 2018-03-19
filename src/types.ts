import { ExternalTransaction, Transaction } from 'vineyard-blockchain'

export interface TransactionHandler {
    shouldTrackTransaction(transaction: ExternalTransaction): Promise<boolean>
    onConfirm(transaction: Transaction): Promise<Transaction>
}

export interface Address {
  address: string
  isActive: boolean
}

export const bitcoinCurrency = {
  id: 1,
  name: 'Bitcoin'
}