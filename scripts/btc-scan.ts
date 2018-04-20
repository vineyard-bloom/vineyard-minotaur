import { createBitcoinVillage, startBitcoinMonitor } from "../lab/bitcoin-explorer-service"
import { localConfig } from '../config/config-btc'
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"

require('source-map-support').install()

async function initialize(model: any) {
  await (model.ground as any).regenerate()
  await model.Currency.create({ name: 'Bitcoin' })
  await model.Currency.create({ name: 'Ethereum' })
  // await model.LastBlock.create({ currency: 2, blockIndex: 46401 })
  await model.LastBlock.create({ currency: 2 })
}

async function main() {
  const bitcoinConfig = localConfig.bitcoin
  const village = await createBitcoinVillage(localConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig))
  console.log('Initialized village')

  await startBitcoinMonitor(village, {
    queue: { maxSize: 10, minSize: 5 },
  })
}

main()