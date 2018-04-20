import { createBitcoinVillage, startBitcoinMonitor } from "../lab/bitcoin-explorer-service"
import { localConfig } from '../config/config-btc'
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"
import { resetBtcScanDb } from "./reset-btc-scan-db"

require('source-map-support').install()

async function main(resetDb?: string) {
  if(resetDb && resetDb === '-r'){
    await resetBtcScanDb(localConfig)
  }
  const bitcoinConfig = localConfig.bitcoin
  const village = await createBitcoinVillage(localConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig))
  console.log('Initialized village')

  await startBitcoinMonitor(village, {
    queue: { maxSize: 10, minSize: 5 },
  })
}

main(process.argv[2])