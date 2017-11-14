import {ExternalSingleTransaction as ExternalTransaction, SingleTransaction as Transaction} from "vineyard-blockchain"

export interface TransactionHandler {
    shouldTrackTransaction(transaction: ExternalTransaction): Promise<boolean>
    onConfirm(transaction: Transaction): Promise<Transaction>
}