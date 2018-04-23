import { AssociatedInput, AssociatedOutput } from "./bitcoin-explorer"
import { blockchain } from "vineyard-blockchain/src/blockchain"
import MultiTransaction = blockchain.MultiTransaction

export function selectTxidClause (txid: string | undefined) {
  return txid ? `(SELECT tx.id FROM transactions tx WHERE tx.txid = '${txid}')` : 'NULL'
}

export function nullify (value: any) {
  return (value === undefined || value === null) ? 'NULL' : value
}

export function nullifyString (value: string | undefined | null) {
  return (value === undefined || value === null) ? 'NULL' : "'" + value + "'"
}

export function CREATE_TX_IN (association: AssociatedInput): string {
  const {txid, index, input} = association
  return `(${selectTxidClause(txid)}, '${index}', ${selectTxidClause(input.txid)}, ${nullify(input.vout)}, ${input.scriptSig ? "'" + input.scriptSig.hex + "'" : 'NULL'}, ${input.scriptSig ? "'" + input.scriptSig.asm + "'" : 'NULL'}, ${input.sequence}, ${nullifyString(input.coinbase)},  NOW(), NOW())`
}

export function CREATE_TX_OUT (association: AssociatedOutput, addressId: number): string {
  const {output, txid, index} = association
  return `(${selectTxidClause(txid)}, ${index}, '${output.scriptPubKey.hex}', '${output.scriptPubKey.asm}', '${addressId}', ${output.valueSat}, NOW(), NOW())`
}

export function CREATE_TX(transaction: MultiTransaction): string {
  return `(${transaction.status}, '${transaction.txid}', ${transaction.fee}, ${transaction.nonce}, 1, '${transaction.timeReceived.toISOString()}', ${transaction.blockIndex}, NOW(), NOW())`
}