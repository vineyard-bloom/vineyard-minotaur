import { BitcoinVillage, createBitcoinVillage } from "../../../lab/bitcoin-explorer-service"
import { BitcoinModel, BitcoinTransaction, TxOut, TxIn } from "../../../src/bitcoin-explorer/bitcoin-model"
import { bitcoinConfig } from "../../../config/config-btc"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { resetBtcScanDb } from "../../../scripts/reset-btc-scan-db"
import { Omit } from "vineyard-bitcoin/src/types"
import { Address, ID } from "../../../src/types"
import { blockchain } from "vineyard-blockchain/src/blockchain"
import { BigNumber } from "bignumber.js"
import { getUtxos } from "../../../src/queries/get-utxos"
import * as assert from "assert"

require('source-map-support').install()

const second = 1000
const minute = 60 * second

describe('get-utxos', function () {
  let village: BitcoinVillage
  let model: BitcoinModel

  before(async function(){
    const bitcoinConfig = bitcoinConfig.bitcoin
    village = await createBitcoinVillage(bitcoinConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig))
    model = village.model
  })

  beforeEach(async function () {
    await resetBtcScanDb(village)
  })

  it('gets single utxo', async function () {
    const { id: addressId, address } = await model.Address.create(randomAddressSeed())
    const { id: transactionId, txid } = await model.Transaction.create(randomTransactionSeed())
    const { index, amount } = await model.TxOut.create(randomTxoutSeed(transactionId, addressId))
    const utxos = await getUtxos(model.ground, address)
    assert.equal(utxos.length, 1)

    const utxo = utxos[0]
    assert.equal(utxo.txid, txid.trim())
    assert.deepEqual(utxo.amount, amount)
    assert.equal(utxo.index, index)
  })

  it('doesnt return spent txo', async function () {
    const { id: addressId, address } = await model.Address.create(randomAddressSeed())
    const { id: depositTransactionId } = await model.Transaction.create(randomTransactionSeed())
    const { index: vout } = await model.TxOut.create(randomTxoutSeed(depositTransactionId, addressId))

    const { id: spendingTransactionId } = await model.Transaction.create(randomTransactionSeed())
    await model.TxIn.create(randomTxinSeed(spendingTransactionId, depositTransactionId, vout))
    const utxos = await getUtxos(model.ground, address)

    assert.equal(utxos.length, 0)
  })

  it('doesnt return utxos for wrong address', async function () {
    const { id: addressWeDontWantId, address: addressWeDontWant } = await model.Address.create(randomAddressSeed())
    const { id: addressWeWantId, address: addressWeWant } = await model.Address.create(randomAddressSeed())

    const { id: depositTransactionId } = await model.Transaction.create(randomTransactionSeed())
    const firstTxout = randomTxoutSeed(depositTransactionId, addressWeWantId, 0)
    const { index: voutWeWant } = await model.TxOut.create(firstTxout)
    const { index: voutWeDontWant } = await model.TxOut.create(randomTxoutSeed(depositTransactionId, addressWeDontWantId, 1))

    const utxos = await getUtxos(model.ground, addressWeWant)

    assert.equal(utxos.length, 1)
    assert.equal(utxos[0].index, voutWeWant)
  })

  it('gets multiple utxos from same and different txs', async function () {
    const { id: addressId, address } = await model.Address.create(randomAddressSeed())
    const { id: transactionId1 } = await model.Transaction.create(randomTransactionSeed())
    await model.TxOut.create(randomTxoutSeed(transactionId1, addressId, 0))
    await model.TxOut.create(randomTxoutSeed(transactionId1, addressId, 1))

    const { id: transactionId2 } = await model.Transaction.create(randomTransactionSeed())
    await model.TxOut.create(randomTxoutSeed(transactionId2, addressId, 0))

    const utxos = await getUtxos(model.ground, address)
    assert.equal(utxos.length, 3)
  })
})

function randomAddressSeed(): Omit<Address, 'id'> {
  return {address: 'address-' + getRandomString()}
}

function randomTransactionSeed(): Omit<BitcoinTransaction, 'id'> {
  return {
      txid: 'txid-' + getRandomString(),
      timeReceived: new Date(),
      blockIndex: 10,
      status: blockchain.TransactionStatus.pending,
      currency: 1,
      fee: new BigNumber(getRandomIntInclusive(0, 3)),
      nonce: getRandomIntInclusive()
  }
}

function randomTxoutSeed(transactionId: ID<BitcoinTransaction>, addressId: ID<Address>, index: number = getRandomIntInclusive(0, 6)): TxOut {
  return {
    transaction: transactionId,
    index,
    scriptPubKeyHex: 'pubKeyHex-'+ getRandomString(),
    scriptPubKeyAsm: 'pubKeyAsm-'+ getRandomString(),
    address: addressId,
    amount: new BigNumber(10 * getRandomIntInclusive())
  }
}

function randomTxinSeed(transactionId: ID<BitcoinTransaction>, sourceTransactionId: ID<BitcoinTransaction>, sourceIndex: number): TxIn {
  return {
    transaction: transactionId,
    index: getRandomIntInclusive(0, 5),
    sourceTransaction: sourceTransactionId,
    sourceIndex,
    scriptSigHex: 'scriptSigHex-'+ getRandomString(),
    scriptSigAsm: 'scriptSigAsm-'+ getRandomString(),
    sequence: getRandomIntInclusive(),
    coinbase: undefined
  }
}

export function getRandomString (length: number = 4): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text.trim()
}

export function getRandomIntInclusive (min: number = 0, max: number = 1000): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}
