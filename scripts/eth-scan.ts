require('source-map-support').install()
import { createEthereumVillage, startEthereumMonitor } from "../lab"
import {localConfig} from '../config/config'
import {Cron} from 'vineyard-cron'

async function main(): Promise<void> {
  const village = await createEthereumVillage(localConfig)
  console.log('Initialized village')

  await startEthereumMonitor(village, {
    queue: { maxSize: 10, minSize: 5 },
    // maxMilliseconds: 30000,
  })
}

// main()
const ethCron = new Cron([
  {
    name: 'Ethereum Scanner',
    action: () => main()
  }
], 15000)

ethCron.start()