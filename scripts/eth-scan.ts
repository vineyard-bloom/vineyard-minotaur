require('source-map-support').install()
import { createEthereumVillage, startEthereumMonitor } from "../lab"
import { ethereumConfig } from '../config/config'
import { Cron } from 'vineyard-cron'

async function main(): Promise<void> {
  const village = await createEthereumVillage(ethereumConfig)
  console.log('Initialized village')

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