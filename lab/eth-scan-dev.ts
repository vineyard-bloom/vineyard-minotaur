require('source-map-support').install()
import { createEthereumVillage, startEthereumMonitor } from "../lab"
import { ethereumConfig } from '../config/config'
import { Cron } from 'vineyard-cron'
import { EthereumModel } from '../src'

async function main(): Promise<void> {
  const village = await createEthereumVillage(ethereumConfig)
  console.log('Initialized village')

  let model: EthereumModel = village.model
  await (model.ground).regenerate()
  console.log('Vineyard Ground model regenerated')
  await model.Currency.create({ name: 'Bitcoin' })
  await model.Currency.create({ name: 'Ethereum' })
  await model.LastBlock.create({ currency: 2 })

  await startEthereumMonitor(village, {
    queue: ethereumConfig.blockQueue,
    profiling: ethereumConfig.profiling ? true : false
  })
}

const ethereumCron = new Cron([
  {
    name: 'Ethereum Scanner',
    action: () => main()
  }
], ethereumConfig.interval)

ethereumCron.start()
