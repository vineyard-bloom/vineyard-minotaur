import { MinotaurVillage } from "./village";
import {
  createEthereumExplorerDao, createSingleCurrencyTransactionDao, EthereumModel, MonitorConfig,
  scanEthereumExplorerBlocks
} from "../src/index";
import { decodeTokenTransfer, EthereumBlockReader } from '../../vineyard-ethereum/src/index'
import { SimpleProfiler } from "../src/utility/index";

export async function startEthereumMonitor(village: MinotaurVillage<EthereumModel>, config: MonitorConfig) {
  try {
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
  catch (error) {
    console.error(error)
  }
}