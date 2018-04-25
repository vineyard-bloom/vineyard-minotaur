require('source-map-support').install()
import { createEthereumVillage, startEthereumMonitor } from "../lab";
import {ethereumConfig} from '../config/config-eth'

async function main(): Promise<void> {
  const village = await createEthereumVillage(ethereumConfig)
  console.log('Initialized village')
  await startEthereumMonitor(village, {
    queue: { maxSize: 10, minSize: 5 },
    // maxMilliseconds: 30000,
  })
}

main()