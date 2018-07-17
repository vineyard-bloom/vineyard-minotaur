import { assert } from 'chai'
import { deleteFullBlocks } from "../../src";
import { BitcoinModel, createBitcoinExplorerDao, BitcoinMonitorDao } from '../../src/bitcoin-explorer/bitcoin-model';
import { createBitcoinVillage } from "../../lab/bitcoin-explorer-service"
import { bitcoinConfig } from "../../config/config"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { DevModeler } from "vineyard-ground/source/modeler"
import { randomBlock, randomBitcoinTransaction, randomBitcoinTxIn, randomBitcoinTxOut } from './random-type-helpers';
import { ScannedBlockStatus } from '../../src/monitor-logic';

describe('bitcoin block saving test', function () {
  let model: BitcoinModel
  let dao: BitcoinMonitorDao

  before(async() => {
    const village = await createBitcoinVillage(bitcoinConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig.bitcoin))
    model = village.model
    dao = createBitcoinExplorerDao(model)
  })

  beforeEach(async () => {
    await (model.ground as DevModeler).regenerate()
  })

  it('can delete one of two saved blocks', async function () {
    const blockOne = randomBlock()
    const blockTwo = randomBlock()
    await model.Block.create(blockOne)
    await model.Block.create(blockTwo)

    await deleteFullBlocks(model.ground, [ blockOne.index ])
    assert(!await model.Block.get(blockOne.index))
    assert(await model.Block.get(blockTwo.index))
  })

  it('can delete no blocks at all', async function () {
    await deleteFullBlocks(model.ground, [])
  })

  it('can delete one of two saved blocks and dependent transactions', async function() {
    await model.Currency.create({id: 1, name: 'btc'})
    await model.Address.create({id: 6, address: 'River'})

    const blockOne = await randomBlock()
    const blockTwo = await randomBlock()
    await model.Block.create(blockOne)
    await model.Block.create(blockTwo)

    const transactionOne = await randomBitcoinTransaction(blockOne.index)
    const transactionTwo = await randomBitcoinTransaction(blockOne.index)
    const transactionThree = await randomBitcoinTransaction(blockTwo.index)
    const transactionFour = await randomBitcoinTransaction(blockTwo.index)
    await model.Transaction.create(transactionOne)
    await model.Transaction.create(transactionTwo)
    await model.Transaction.create(transactionThree)
    await model.Transaction.create(transactionFour)

    const txInOne = await randomBitcoinTxIn(transactionOne.id)
    const txOutOne = await randomBitcoinTxOut(transactionTwo.id, 6)
    const txInTwo = await randomBitcoinTxIn(transactionThree.id)
    const txOutTwo = await randomBitcoinTxOut(transactionFour.id, 6)
    await model.TxIn.create(txInOne)
    await model.TxOut.create(txOutOne)
    await model.TxIn.create(txInTwo)
    await model.TxOut.create(txOutTwo)

    await deleteFullBlocks(model.ground, [ blockOne.index ])

    assert(!await model.Transaction.get(transactionOne.id))
    assert(!await model.Transaction.get(transactionTwo.id))
    assert(await model.Transaction.get(transactionThree.id))
    assert(await model.Transaction.get(transactionFour.id))

    assert(!await model.TxIn.get(txInOne.transaction))
    assert(!await model.TxOut.get(txOutOne.transaction))
    assert(await model.TxIn.get(txInTwo.transaction))
    assert(await model.TxOut.get(txOutTwo.transaction))
  })
})