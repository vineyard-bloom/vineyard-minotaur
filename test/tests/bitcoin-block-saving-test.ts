import { assert } from 'chai'
import { checkBlockScanStatus } from "../../src";
import { BitcoinModel, createBitcoinExplorerDao, BitcoinMonitorDao } from '../../src/bitcoin-explorer/bitcoin-model';
import { createBitcoinVillage } from "../../lab/bitcoin-explorer-service"
import { bitcoinConfig } from "../../config/config-btc"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { DevModeler } from "vineyard-ground/source/modeler"
import { ScannedBlockStatus } from "../../src/bitcoin-explorer/bitcoin-explorer"

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
    const newBlock = {
      hash: 'hashstring',
      index: 1,
      timeMined: new Date()
    }
    const block = await model.Block.create(newBlock)

    const scannedBlockStatus = await checkBlockScanStatus(dao, block)
    assert.equal(ScannedBlockStatus.UpToDate, scannedBlockStatus)
  })

  it('can detect when block has  been rescanned with changes', async function () {
    const newBlock = {
      hash: 'originalHash',
      index: 1,
      timeMined: new Date()
    }
    const block = await model.Block.create(newBlock)

    const scannedBlockStatus = await checkBlockScanStatus(dao, {index: block.index, hash: 'newHash'})
    assert.equal(ScannedBlockStatus.Outdated, scannedBlockStatus)
  })

  it('can detect when block has never been scanned', async function () {
    const scannedBlockStatus = await checkBlockScanStatus(dao, {index: 1, hash: 'originalHash'})
    assert.equal(ScannedBlockStatus.Nonexistent, scannedBlockStatus)
  })
})