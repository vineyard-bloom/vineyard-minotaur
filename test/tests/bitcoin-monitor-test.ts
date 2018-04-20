import { localConfig } from "../config/config"
import { assert } from 'chai'
import { BitcoinVillage, createBitcoinVillage, startBitcoinMonitor } from "../../lab"
import { BitcoinModel } from "../../src/bitcoin-explorer/bitcoin-model"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { MultiTransactionBlockClient } from "../../src/bitcoin-explorer/bitcoin-explorer"
import { resetBtcScanDb } from "../../scripts/reset-btc-scan-db"
import { BitcoinLab } from "vineyard-bitcoin/lab/bitcoin-lab"
import { BitcoinClient } from "vineyard-bitcoin/src/bitcoin-client"
import { regtestWalletConfig } from "../config/regtest-wallet-config"

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
    const bitcoinConfig = localConfig.bitcoin
    village = await createBitcoinVillage(localConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig))
    model = village.model
    const { username: user, password: pass, ...common } = bitcoinConfig
    const classicalBitcoinConfig = { user, pass, ...common }
  })

  beforeEach(async function () {
    await resetBtcScanDb(village)
  })

  it('from start', async function () {
    console.log('Initialized village')
    await startBitcoinMonitor(village, {
      queue: { maxSize: 10, minSize: 5 },
      maxMilliseconds: minute
    })
    assert(true)
  })

  it('retrieves coinbase txs', async function () {
    console.log('Initialized village')
  })
})