import { getRandomString, getRandomBigNumberInclusive, getRandomIntInclusive } from "./random-utilities"
import { blockchain } from "vineyard-blockchain"
import { BitcoinTransaction } from "../../src"
import { TxIn, TxOut } from "../../src/bitcoin-explorer/bitcoin-model";

export function randomBlock(): blockchain.Block {
  return {
    hash: getRandomString(10),
    index: getRandomIntInclusive(1, 1000),
    timeMined: new Date()
  }
}

export function randomBitcoinTransaction(index?: number): BitcoinTransaction {
  return {
    currency: 1,
    id: getRandomIntInclusive(1, 1000),
    blockIndex: index || getRandomIntInclusive(1, 1000),
    txid: getRandomString(10),
    timeReceived: new Date(),
    status: 3, /* Can also use getRandomEnumValue of TransactionStatus */
    fee: getRandomBigNumberInclusive(1, 1000),
    nonce: getRandomIntInclusive(1, 1000)
  }
}

// TxIn
  // transaction: ID<BitcoinTransaction>
  // index: number
  // sourceTransaction: ID<BitcoinTransaction> | undefined
  // sourceIndex: number | undefined
  // scriptSigHex: string | undefined
  // scriptSigAsm: string | undefined
  // sequence: number
  // coinbase: string | undefined

export function randomBitcoinTxIn(id?: number): TxIn {
  return {
    transaction: id || getRandomIntInclusive(1, 1000),
    index: getRandomIntInclusive(1, 1000),
    sourceTransaction: undefined,
    sourceIndex: undefined,
    scriptSigHex: undefined,
    scriptSigAsm: undefined,
    sequence: getRandomIntInclusive(1, 1000),
    coinbase: undefined
  }
}

// TxOut
  // transaction: ID<BitcoinTransaction>,
  // index: number,
  // scriptPubKeyHex: string,
  // scriptPubKeyAsm: string,
  // address: ID<Address>,
  // amount: BigNumber

export function randomBitcoinTxOut(transactionId?: number, address?: number): TxOut {
  return {
    transaction: transactionId || getRandomIntInclusive(1, 1000),
    index: getRandomIntInclusive(1, 1000),
    scriptPubKeyHex: getRandomString(10),
    scriptPubKeyAsm: getRandomString(10),
    address: address || getRandomIntInclusive(1, 1000),
    amount: getRandomBigNumberInclusive(1, 1000),
  }
}