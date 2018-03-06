import { Village } from "./village";
import {
  createEthereumExplorerDao, createSingleCurrencyTransactionDao, MonitorConfig,
  scanEthereumExplorerBlocks
} from "../../src";
import { decodeTokenTransfer, EthereumBlockReader } from 'vineyard-ethereum'
import { SimpleProfiler } from "../../src/profiler";

export async function startEthereumMonitor(village: Village, config: MonitorConfig) {
  const model = village.model
  const ethereumConfig = village.config.ethereum
  const client = EthereumBlockReader.createFromConfig(ethereumConfig.client)
  const dao = createEthereumExplorerDao(model)
  const transactionDao = createSingleCurrencyTransactionDao(model)
  console.log('Starting cron')
  const profiler = new SimpleProfiler()
  await scanEthereumExplorerBlocks(dao, client, decodeTokenTransfer, config, profiler)
  profiler.logFlat()
}