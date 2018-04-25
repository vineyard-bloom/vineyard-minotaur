import { createVillage, MinotaurVillage } from "./village";
import {
  createEthereumExplorerDao, createSingleCurrencyTransactionDao, EthereumModel, MonitorConfig,
  scanEthereumExplorerBlocks, getEthereumExplorerSchema
} from "../src";
import { SimpleProfiler } from "../src/utility";
import { EthereumConfig, FullConfig } from "./config-types";
import { EthereumBlockReader } from "vineyard-ethereum/src/block-reader"
import { decodeTokenTransfer } from "vineyard-ethereum/src/client-functions"

export type EthereumVillage = MinotaurVillage<EthereumModel, EthereumConfig>

export async function startEthereumMonitor(village: EthereumVillage, config: MonitorConfig) {
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

export function createEthereumVillage(config: EthereumConfig): Promise<EthereumVillage> {
  return createVillage(getEthereumExplorerSchema(), config)
}