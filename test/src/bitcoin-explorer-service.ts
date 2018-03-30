import { Village } from "./village";
import { createEthereumExplorerDao, MonitorConfig, scanBitcoinExplorerBlocks, BitcoinModel } from "../../src"
import { SimpleProfiler } from "../../src/utility"
import { BitcoinBlockReader } from 'vineyard-bitcoin'

export async function startBitcoinMonitor(village: Village<BitcoinModel>, config: MonitorConfig) {
  try {
    const model = village.model
    const bitcoinConfig = village.config.bitcoin
    const client = BitcoinBlockReader.createFromConfig(bitcoinConfig)
    const dao = createEthereumExplorerDao(model)
    console.log('Starting cron')
    const profiler = new SimpleProfiler()
    await scanBitcoinExplorerBlocks(dao, client, config, profiler)
    profiler.logFlat()
  }
  catch (error) {
    console.error(error)
  }
}