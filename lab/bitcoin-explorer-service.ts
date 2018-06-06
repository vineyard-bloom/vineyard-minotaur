import { createVillage, MinotaurVillage } from "./village";
import { OptionalMonitorConfig, scanBitcoinExplorerBlocks } from "../src"
import { SimpleProfiler, EmptyProfiler } from "../src/utility"
import { BitcoinConfig, FullConfig } from "./config-types";
import { getBitcoinExplorerSchema } from "../src/schema";
import { BitcoinModel, createBitcoinExplorerDao } from "../src/bitcoin-explorer/bitcoin-model"
import { MultiTransactionBlockClient } from "../src/bitcoin-explorer/bitcoin-explorer"

export type BitcoinVillage = MinotaurVillage<BitcoinModel, BitcoinConfig> & { client: MultiTransactionBlockClient }

export async function startBitcoinMonitor(village: BitcoinVillage, config: OptionalMonitorConfig) {
  try {
    const defaults = {
      minConfirmations: 7
    }
    const appliedConfig = Object.assign({}, defaults, config)
    
    const { model, client } = village

    const dao = createBitcoinExplorerDao(model)
    console.log('Starting cron')
    const profiler = config.profiling ? new SimpleProfiler() : new EmptyProfiler()
    await scanBitcoinExplorerBlocks(dao, client, appliedConfig, profiler)
  }
  catch (error) {
    console.error(error)
  }
}

export async function createBitcoinVillage(config: BitcoinConfig, client: MultiTransactionBlockClient): Promise<BitcoinVillage> {
  const minotaurVillage = await createVillage<BitcoinModel, BitcoinConfig>(getBitcoinExplorerSchema(), config)
  return { ...minotaurVillage, client }
}