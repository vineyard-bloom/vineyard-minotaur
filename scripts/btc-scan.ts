import { createBitcoinVillage, startBitcoinMonitor } from "../lab/bitcoin-explorer-service"
import { bitcoinConfig } from '../config/config'
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { resetBtcScanDb } from "./reset-btc-scan-db"
import {Cron} from 'vineyard-cron'

require('source-map-support').install()

async function main(resetDb?: string) {
  const village = await createBitcoinVillage(bitcoinConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig.bitcoin))
  console.log('Initialized village')

  if(resetDb && resetDb === '-r'){
    await resetBtcScanDb(village)
  }

  await startBitcoinMonitor(village, {
    queue: { maxSize: 10, minSize: 5 }
  })
}

const bitcoinCron = new Cron([
  {
    name: 'Bitcoin Scanner',
    action: () => main(process.argv[2])
  }
], bitcoinConfig.interval)

bitcoinCron.start()