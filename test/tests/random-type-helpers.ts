import { getRandomString, getRandomBigNumberInclusive, getRandomIntInclusive } from "./random-utilities"
import { blockchain } from "vineyard-blockchain"
import { BitcoinTransaction } from "../../src"
import { TxIn, TxOut } from "../../src/bitcoin-explorer/bitcoin-model";

export function randomBlock(): blockchain.Block {
  return {
    index: getRandomIntInclusive(1, 1000),
    number: Math.random() * 10,
    hash: getRandomString(10),
    timeMined: new Date(),
    coinbase: getRandomString(10),
    difficulty: getRandomString(10),
    parentHash: getRandomString(10)
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