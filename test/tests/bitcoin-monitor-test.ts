import { getBitcoinExplorerSchema } from "../../src/schema/index";

require('source-map-support').install()
import { BitcoinModel} from "../../src";
import { createVillage, Village } from "../src/village";
import { assert } from 'chai'
import { startBitcoinMonitor } from "../src/bitcoin-explorer-service";

const second = 1000
const minute = 60 * second

type BitcoinVillage = Village<BitcoinModel>

describe('btc-scan', function () {
  this.timeout(10 * minute)
  let village: BitcoinVillage
  let model: BitcoinModel

  beforeEach(async function () {
    village = await createVillage(getBitcoinExplorerSchema())
    model = village.model
    await (model.ground as any).regenerate()
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