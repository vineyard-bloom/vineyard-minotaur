import { MinotaurVillage } from "./village";
import { createEthereumExplorerDao, MonitorConfig, scanBitcoinExplorerBlocks, BitcoinModel } from "../src/index"
import { SimpleProfiler } from "../src/utility/index"
import { BitcoinBlockReader } from '../../vineyard-bitcoin/src/index'

export async function startBitcoinMonitor(village: MinotaurVillage<BitcoinModel>, config: MonitorConfig) {
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