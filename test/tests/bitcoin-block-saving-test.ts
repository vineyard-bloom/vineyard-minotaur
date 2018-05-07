import { assert } from 'chai'
import { checkBlockScanStatus, deleteFullBlocks } from "../../src";
import { BitcoinModel, createBitcoinExplorerDao, BitcoinMonitorDao } from '../../src/bitcoin-explorer/bitcoin-model';
import { createBitcoinVillage } from "../../lab/bitcoin-explorer-service"
import { bitcoinConfig } from "../../config/config-btc"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { DevModeler } from "vineyard-ground/source/modeler"
import { ScannedBlockStatus } from "../../src/bitcoin-explorer/bitcoin-explorer"
import { randomBlock, randomBitcoinTransaction } from './random-type-helpers';

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
    assert.equal(ScannedBlockStatus.UpToDate, scannedBlockStatus)
  })

  it('can detect when block has  been rescanned with changes', async function () {
    const newBlock = randomBlock()
    const block = await model.Block.create(newBlock)

    const scannedBlockStatus = await checkBlockScanStatus(dao, {index: block.index, hash: 'newHash'})
    assert.equal(ScannedBlockStatus.Outdated, scannedBlockStatus)
  })

  it('can detect when block has never been scanned', async function () {
    const scannedBlockStatus = await checkBlockScanStatus(dao, {index: 1, hash: 'originalHash'})
    assert.equal(ScannedBlockStatus.Nonexistent, scannedBlockStatus)
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

  // Blocks have transactions and txins and txouts. Make sure all dependent transactions, txins, txouts are deleted, but none from the non-deleted block. 
  it('can delete one of two saved blocks and dependent transactions', async function() {
    const blockOne = randomBlock()
    const blockTwo = randomBlock()

    const transactionOneOne = randomBitcoinTransaction(blockOne.index)
    const transactionOneTwo = randomBitcoinTransaction(blockOne.index)
    const transactionTwoOne = randomBitcoinTransaction(blockTwo.index)
    const transactionTwoTwo = randomBitcoinTransaction(blockTwo.index)

    await model.Block.create(blockOne)
    await model.Block.create(blockTwo)

    await model.Transaction.create(transactionOneOne)
    await model.Transaction.create(transactionOneTwo)
    await model.Transaction.create(transactionTwoOne)
    await model.Transaction.create(transactionTwoTwo)

    await deleteFullBlocks(model.ground, [ blockOne ])

    assert(!await model.Transaction.get(transactionOneOne.id))
    assert(!await model.Transaction.get(transactionOneTwo.id))
    assert(await model.Transaction.get(transactionTwoOne.id))
    assert(await model.Transaction.get(transactionTwoTwo.id))
  })
})