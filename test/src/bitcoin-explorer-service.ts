import { Village } from "./village";
import { createEthereumExplorerDao, MonitorConfig, scanBitcoinExplorerBlocks } from "../../src";
import { decodeTokenTransfer, EthereumBlockReader } from 'vineyard-ethereum'
import { SimpleProfiler } from "../../src/utility/profiler";

export async function startBitcoinMonitor(village: Village, config: MonitorConfig) {
  try {
    const model = village.model
    const bitcoinConfig = village.config.ethereum
    const client = EthereumBlockReader.createFromConfig(bitcoinConfig.client)
    const dao = createEthereumExplorerDao(model)
    console.log('Starting cron')
    const profiler = new SimpleProfiler()
    await scanBitcoinExplorerBlocks(dao, client, decodeTokenTransfer, config, profiler)
    profiler.logFlat()
  }
  catch (error) {
    console.error(error)
  }
}