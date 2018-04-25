import { createBitcoinVillage, startBitcoinMonitor } from "../lab/bitcoin-explorer-service"
import { bitcoinConfig } from '../config/config-btc'
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { resetBtcScanDb } from "./reset-btc-scan-db"

require('source-map-support').install()

async function main(resetDb?: string) {
  const bitcoinConfig = bitcoinConfig.bitcoin
  const village = await createBitcoinVillage(bitcoinConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig))
  console.log('Initialized village')

  if(resetDb && resetDb === '-r'){
    await resetBtcScanDb(village)
  }

  await startBitcoinMonitor(village, {
    queue: { maxSize: 10, minSize: 5 },
  })
}

main(process.argv[2])