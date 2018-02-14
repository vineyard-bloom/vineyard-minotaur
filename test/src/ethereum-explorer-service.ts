import { Village } from "./village";
import {
  createEthereumExplorerDao, createSingleCurrencyTransactionDao, MonitorConfig,
  scanEthereumExplorerBlocks
} from "../../src";
import { EthereumBlockClient } from 'vineyard-ethereum'

export function startEthereumMonitor(village: Village, config:MonitorConfig) {
  const model = village.model
  const ethereumConfig = village.config.ethereum
  const client = EthereumBlockClient.createFromConfig(ethereumConfig.client)
  const dao = createEthereumExplorerDao(model)
  const transactionDao = createSingleCurrencyTransactionDao(model)
  console.log('Starting cron')
  return scanEthereumExplorerBlocks(dao, client, config)
}
