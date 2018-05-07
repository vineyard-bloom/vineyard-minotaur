import { getRandomString, getRandomBigNumberInclusive, getRandomIntInclusive } from "./random-utilities"
import { blockchain } from "vineyard-blockchain"
import { BitcoinTransaction } from "../../src"

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