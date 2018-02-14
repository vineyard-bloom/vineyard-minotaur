require('source-map-support').install()
import { EthereumModel } from "../../src";
import { createVillage, Village } from "../src/village";
import { startEthereumMonitor } from "../src/ethereum-explorer-service";
import { assert } from 'chai'

const minute = 60 * 1000

describe('eth-scan', function () {
  this.timeout(10 * minute)
  let village: Village
  let model: EthereumModel

  beforeEach(async function () {
    village = await createVillage()
    model = village.model
    await (model.ground as any).regenerate()
    await model.Currency.create({ name: "Bitcoin" })
    await model.Currency.create({ name: "Ethereum" })
  })

  it('from start', async function () {
    await model.LastBlock.create({ currency: 2 })
    console.log('Initialized village')
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 1 * minute
    })
    assert(true)
  })

  it('from 4 mil', async function () {
    await model.LastBlock.create({ currency: 2, blockIndex: 4000000 })
    console.log('Initialized village')
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 1 * minute
    })
    assert(true)
  })

  it('can rescan', async function () {
    await model.LastBlock.create({ currency: 2, blockIndex: 4000000 })
    console.log('Initialized village')
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 0.1 * minute
    })

    await model.LastBlock.update({ currency: 2, blockIndex: 4000000 })
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 0.2 * minute
    })
    assert(true)
  })

  it('scans tokens', async function () {
    await model.LastBlock.create({ currency: 2, blockIndex: 4086319 })
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 1,
      maxMilliseconds: 0.1 * minute
    })

    const currencies = await model.Currency.all()
    assert.isAtLeast(currencies.length, 3)
  })

})