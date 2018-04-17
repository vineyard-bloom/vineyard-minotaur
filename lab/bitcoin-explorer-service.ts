import { createVillage, MinotaurVillage } from "./village";
import { createEthereumExplorerDao, MonitorConfig, scanBitcoinExplorerBlocks, EthereumModel } from "../src"
import { SimpleProfiler } from "../src/utility"
import { FullConfig } from "./config-types";
import { getBitcoinExplorerSchema } from "../src/schema";
import { BitcoinBlockReader } from "vineyard-bitcoin";
import { BitcoinModel, createBitcoinExplorerDao } from "../src/bitcoin-explorer/bitcoin-model"

export type BitcoinVillage = MinotaurVillage<BitcoinModel>

export async function startBitcoinMonitor(village: BitcoinVillage, config: MonitorConfig) {
  try {
    const model = village.model
    const bitcoinConfig = village.config.bitcoin
    const client = BitcoinBlockReader.createFromConfig(bitcoinConfig)
    const dao = createBitcoinExplorerDao(model)
    console.log('Starting cron')
    const profiler = new SimpleProfiler()
    await scanBitcoinExplorerBlocks(dao, client, config, profiler)
    profiler.logFlat()
  }
  catch (error) {
    console.error(error)
  }
}

export async function createBitcoinVillage(config: FullConfig): Promise<BitcoinVillage> {
  return createVillage<BitcoinModel>(getBitcoinExplorerSchema(), config)
}