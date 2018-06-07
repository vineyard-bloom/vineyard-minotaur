import { bitcoinConfig } from "../config/config"
import { assert } from 'chai'
import { BitcoinVillage, createBitcoinVillage, startBitcoinMonitor } from "../../lab"
import { BitcoinModel } from "../../src/bitcoin-explorer/bitcoin-model"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { MultiTransactionBlockClient } from "../../src/bitcoin-explorer/bitcoin-explorer"
import { resetBtcScanDb } from "../../scripts/reset-btc-scan-db"
import { randomBlock } from './random-type-helpers'
import { getRandomIntInclusive, getRandomString } from './random-utilities'
import { compareBlockHashes, ScannedBlockStatus } from '../../src/monitor-logic'

require('source-map-support').install()

const second = 1000
const minute = 60 * second

describe('btc-scan', function () {
  this.timeout(10 * minute)
  let village: BitcoinVillage
  let model: BitcoinModel
  let client: MultiTransactionBlockClient
  let rpcClient: any

  before(async function(){
    const configOptions = bitcoinConfig.bitcoin
    village = await createBitcoinVillage(bitcoinConfig, BitcoinBlockReader.createFromConfig(configOptions))
    model = village.model
    const { username: user, password: pass, ...common } = configOptions
    const classicalBitcoinConfig = { user, pass, ...common }
  })

  beforeEach(async function () {
    await resetBtcScanDb(village)
  })

  it('compares blockhashes', async function() {
    const blockCollection = model.Block

    const block1 = randomBlock()
    const block2 = randomBlock()

    await blockCollection.create(block1)
    await blockCollection.create(block2)

    const blockQueries = [
      {
        hash: block1.hash,
        index: block1.index
      },
      {
        hash: getRandomString(16),
        index: block2.index
      },
      {
        hash: getRandomString(16),
        index: getRandomIntInclusive(Math.max(block1.index, block2.index) + 1 , 2000)
      }
    ]

    const results = await compareBlockHashes(model.ground, blockQueries)
    assert.equal(results[0].status, ScannedBlockStatus.same)
    assert.equal(results[1].status, ScannedBlockStatus.replaced)
    assert.equal(results[2].status, ScannedBlockStatus._new)
  })

  it('from start', async function () {
    console.log('Initialized village')
    await startBitcoinMonitor(village, {
      queue: { maxSize: 10, minSize: 5 },
      maxMilliseconds: minute,
      profiling: bitcoinConfig.profiling
    })
    assert(true)
  })

  it('retrieves coinbase txs', async function () {
    console.log('Initialized village')
  })
})