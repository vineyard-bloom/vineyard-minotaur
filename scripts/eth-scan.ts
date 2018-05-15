require('source-map-support').install()
import { createEthereumVillage, startEthereumMonitor } from "../lab"
import { ethereumConfig } from '../config/config-eth'
import {Cron} from 'vineyard-cron'

async function main(): Promise<void> {
  const village = await createEthereumVillage(ethereumConfig)
  console.log('Initialized village')

  await startEthereumMonitor(village, {
    queue: { maxSize: 10, minSize: 5 }
  })
}

const ethereumCron = new Cron([
  {
    name: 'Ethereum Scanner',
    action: () => main()
  }
], ethereumConfig.cronInterval)

ethereumCron.start()