import { Village } from "./village";
import {
  createEthereumExplorerDao, createSingleCurrencyTransactionDao, MonitorConfig,
  scanEthereumExplorerBlocks
} from "../../src";
import { EthereumBlockClient } from 'vineyard-ethereum'
import { SimpleProfiler } from "../../src/profiler";

export async function startEthereumMonitor(village: Village, config: MonitorConfig) {
  const model = village.model
  const ethereumConfig = village.config.ethereum
  const client = EthereumBlockClient.createFromConfig(ethereumConfig.client)
  const dao = createEthereumExplorerDao(model)
  const transactionDao = createSingleCurrencyTransactionDao(model)
  console.log('Starting cron')
  const profiler = new SimpleProfiler()
  await scanEthereumExplorerBlocks(dao, client, config, profiler)
  profiler.logFlat()
}
