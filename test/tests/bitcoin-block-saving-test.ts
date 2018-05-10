import { assert } from 'chai'
import { checkBlockScanStatus, deleteFullBlocks } from "../../src";
import { BitcoinModel, createBitcoinExplorerDao, BitcoinMonitorDao } from '../../src/bitcoin-explorer/bitcoin-model';
import { createBitcoinVillage } from "../../lab/bitcoin-explorer-service"
import { bitcoinConfig } from "../../config/config-btc"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { DevModeler } from "vineyard-ground/source/modeler"
import { ScannedBlockStatus } from "../../src/bitcoin-explorer/bitcoin-explorer"
import { randomBlock, randomBitcoinTransaction, randomBitcoinTxIn, randomBitcoinTxOut } from './random-type-helpers';

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

  it('can detect when block has been rescanned with no changes', async function () {
    const newBlock = randomBlock()
    const block = await model.Block.create(newBlock)

    const scannedBlockStatus = await checkBlockScanStatus(dao, block)
    assert.equal(ScannedBlockStatus.same, scannedBlockStatus)
  })

  it('can detect when block has  been rescanned with changes', async function () {
    const newBlock = randomBlock()
    const block = await model.Block.create(newBlock)

    const scannedBlockStatus = await checkBlockScanStatus(dao, {index: block.index, hash: 'newHash'})
    assert.equal(ScannedBlockStatus.replaced, scannedBlockStatus)
  })

  it('can detect when block has never been scanned', async function () {
    const scannedBlockStatus = await checkBlockScanStatus(dao, {index: 1, hash: 'originalHash'})
    assert.equal(ScannedBlockStatus._new, scannedBlockStatus)
  })

  it('can delete one of two saved blocks', async function () {
    const blockOne = randomBlock()
    const blockTwo = randomBlock()
    await model.Block.create(blockOne)
    await model.Block.create(blockTwo)

    await deleteFullBlocks(model.ground, [ blockOne ])
    assert(!await model.Block.get(blockOne.index))
    assert(await model.Block.get(blockTwo.index))
  })

  it('can delete three of five saved blocks', async function () {
    const blockOne = randomBlock()
    const blockTwo = randomBlock()
    const blockThree = randomBlock()
    const blockFour = randomBlock()
    const blockFive = randomBlock()

    await model.Block.create(blockOne)
    await model.Block.create(blockTwo)
    await model.Block.create(blockThree)
    await model.Block.create(blockFour)
    await model.Block.create(blockFive)

    await deleteFullBlocks(model.ground, [ blockOne, blockTwo, blockThree ])

    assert(!await model.Block.get(blockOne.index))
    assert(!await model.Block.get(blockTwo.index))
    assert(!await model.Block.get(blockThree.index))
    assert(await model.Block.get(blockFour.index))
    assert(await model.Block.get(blockFive.index))
  })

  it('can delete one of two saved blocks and dependent transactions', async function() {
    await model.Currency.create({id: 1, name: 'btc'})
    await model.Address.create({id: 6, address: 'River'})

    const blockOne = await randomBlock()
    const blockTwo = await randomBlock()
    await model.Block.create(blockOne)
    await model.Block.create(blockTwo)

    const transactionOneOne = await randomBitcoinTransaction(blockOne.index)
    const transactionOneTwo = await randomBitcoinTransaction(blockOne.index)
    const transactionTwoOne = await randomBitcoinTransaction(blockTwo.index)
    const transactionTwoTwo = await randomBitcoinTransaction(blockTwo.index)
    await model.Transaction.create(transactionOneOne)
    await model.Transaction.create(transactionOneTwo)
    await model.Transaction.create(transactionTwoOne)
    await model.Transaction.create(transactionTwoTwo)

    const txInOne = await randomBitcoinTxIn(transactionOneOne.id)
    const txOutOne = await randomBitcoinTxOut(transactionOneOne.id, 6)
    const txInTwo = await randomBitcoinTxIn(transactionTwoOne.id)
    const txOutTwo = await randomBitcoinTxOut(transactionTwoOne.id, 6)
    await model.TxIn.create(txInOne)
    await model.TxOut.create(txOutOne)
    await model.TxIn.create(txInTwo)
    await model.TxOut.create(txOutTwo)

    await deleteFullBlocks(model.ground, [ blockOne ])

    assert(!await model.Transaction.get(transactionOneOne.id))
    assert(!await model.Transaction.get(transactionOneTwo.id))
    assert(await model.Transaction.get(transactionTwoOne.id))
    assert(await model.Transaction.get(transactionTwoTwo.id))

    assert(!await model.TxIn.get(txInOne.transaction))
    assert(!await model.TxOut.get(txOutOne.transaction))
    assert(await model.TxIn.get(txInTwo.transaction))
    assert(await model.TxOut.get(txOutTwo.transaction))
  })

  it('can delete three of five saved blocks and dependent transactions', async function() {
    await model.Currency.create({id: 1, name: 'btc'})
    await model.Address.create({id: 6, address: 'River'})

    const blockOne = await randomBlock()
    const blockTwo = await randomBlock()
    const blockThree = await randomBlock()
    const blockFour = await randomBlock()
    const blockFive = await randomBlock()
    await model.Block.create(blockOne)
    await model.Block.create(blockTwo)
    await model.Block.create(blockThree)
    await model.Block.create(blockFour)
    await model.Block.create(blockFive)

    const transactionOne = await randomBitcoinTransaction(blockOne.index)
    const transactionTwo = await randomBitcoinTransaction(blockTwo.index)
    const transactionThree = await randomBitcoinTransaction(blockThree.index)
    const transactionFour = await randomBitcoinTransaction(blockFour.index)
    const transactionFive = await randomBitcoinTransaction(blockFive.index)
    await model.Transaction.create(transactionOne)
    await model.Transaction.create(transactionTwo)
    await model.Transaction.create(transactionThree)
    await model.Transaction.create(transactionFour)
    await model.Transaction.create(transactionFive)

    const txInOne = await randomBitcoinTxIn(transactionOne.id)
    const txOutOne = await randomBitcoinTxOut(transactionOne.id, 6)
    const txInTwo = await randomBitcoinTxIn(transactionTwo.id)
    const txOutTwo = await randomBitcoinTxOut(transactionTwo.id, 6)
    const txInThree = await randomBitcoinTxIn(transactionThree.id)
    const txOutThree = await randomBitcoinTxOut(transactionThree.id, 6)
    const txInFour = await randomBitcoinTxIn(transactionFour.id)
    const txOutFour = await randomBitcoinTxOut(transactionFour.id, 6)
    const txInFive = await randomBitcoinTxIn(transactionFive.id)
    const txOutFive = await randomBitcoinTxOut(transactionFive.id, 6)
    await model.TxIn.create(txInOne)
    await model.TxOut.create(txOutOne)
    await model.TxIn.create(txInTwo)
    await model.TxOut.create(txOutTwo)
    await model.TxIn.create(txInThree)
    await model.TxOut.create(txOutThree)
    await model.TxIn.create(txInFour)
    await model.TxOut.create(txOutFour)
    await model.TxIn.create(txInFive)
    await model.TxOut.create(txOutFive)

    await deleteFullBlocks(model.ground, [ blockOne, blockTwo, blockThree ])

    assert(!await model.Transaction.get(transactionOne.id))
    assert(!await model.Transaction.get(transactionOne.id))
    assert(!await model.Transaction.get(transactionTwo.id))
    assert(!await model.Transaction.get(transactionTwo.id))
    assert(!await model.Transaction.get(transactionThree.id))
    assert(!await model.Transaction.get(transactionThree.id))
    assert(await model.Transaction.get(transactionFour.id))
    assert(await model.Transaction.get(transactionFour.id))
    assert(await model.Transaction.get(transactionFive.id))
    assert(await model.Transaction.get(transactionFive.id))

    assert(!await model.TxIn.get(txInOne.transaction))
    assert(!await model.TxOut.get(txOutOne.transaction))
    assert(!await model.TxIn.get(txInTwo.transaction))
    assert(!await model.TxOut.get(txOutTwo.transaction))
    assert(!await model.TxIn.get(txInThree.transaction))
    assert(!await model.TxOut.get(txOutThree.transaction))
    assert(await model.TxIn.get(txInFour.transaction))
    assert(await model.TxOut.get(txOutFour.transaction))
    assert(await model.TxIn.get(txInFive.transaction))
    assert(await model.TxOut.get(txOutFive.transaction))
  })
})