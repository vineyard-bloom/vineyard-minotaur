require('source-map-support').install()
import { createBitcoinVillage, startEthereumMonitor } from "../lab";
import {localConfig} from '../config/config'

async function initialize(model: any) {
  await (model.ground as any).regenerate()
  await model.Currency.create({ name: 'Bitcoin' })
  await model.Currency.create({ name: 'Ethereum' })
  // await model.LastBlock.create({ currency: 2, blockIndex: 46401 })
  await model.LastBlock.create({ currency: 2 })
}

async function main() {
  const village = await createBitcoinVillage(localConfig)
  const model = village.model
  // await initialize(model)
  console.log('Initialized village')
  await startEthereumMonitor(village, {
    queue: { maxSize: 10, minSize: 5 },
    // maxMilliseconds: 30000,
  })
}

main()