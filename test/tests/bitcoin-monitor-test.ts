import { localConfig } from "../config/config"
import { assert } from 'chai'
import { BitcoinVillage, createBitcoinVillage, startBitcoinMonitor } from "../../lab"
import { BitcoinModel } from "../../src/bitcoin-explorer/bitcoin-model"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"

require('source-map-support').install()

const second = 1000
const minute = 60 * second

describe('btc-scan', function () {
  this.timeout(10 * minute)
  let village: BitcoinVillage
  let model: BitcoinModel

  beforeEach(async function () {
    const bitcoinConfig = localConfig.bitcoin
    village = await createBitcoinVillage(localConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig))
    model = village.model
    await (model.ground as any).regenerate()
    await model.Currency.create({ name: 'Bitcoin' })
  })

  it('from start', async function () {
    await model.LastBlock.create({ currency: 2 })
    console.log('Initialized village')
    await startBitcoinMonitor(village, {
      queue: { maxSize: 10, minSize: 5 },
      maxMilliseconds: 1 * minute
    })
    assert(true)
  })
})