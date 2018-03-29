require('source-map-support').install()
import { BitcoinModel } from "../../src";
import { createVillage, Village } from "../src/village";
import { startBitcoinMonitor } from "../src/bitcoin-explorer-service"
import { assert } from 'chai'

const second = 1000
const minute = 60 * second

describe('eth-scan', function () {
  this.timeout(10 * minute)
  let village: Village
  let model: BitcoinModel

  beforeEach(async function () {
    village = await createVillage()
    model = village.model
    await (model.ground as any).regenerate()
  })

  it('from start', async function () {
    await model.LastBlock.create({ currency: 2 })
    console.log('Initialized village')
    await startBitcoinMonitor(village, {
      queue: { maxSize: 10, minSize: 1 },
      maxMilliseconds: 1 * minute
    })
    assert(true)
  })
})