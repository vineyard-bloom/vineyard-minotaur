import { createVillage, MinotaurVillage } from "./village";
import {
  createEthereumExplorerDao, createSingleCurrencyTransactionDao, EthereumModel, OptionalMonitorConfig,
  scanEthereumExplorerBlocks, getEthereumExplorerSchema
} from "../src";
import { SimpleProfiler, EmptyProfiler } from "../src/utility";
import { EthereumConfig, FullConfig } from "./config-types";
import { EthereumBlockReader } from "vineyard-ethereum/src/block-reader"
import { decodeTokenTransfer } from "vineyard-ethereum/src/client-functions"

export type EthereumVillage = MinotaurVillage<EthereumModel, EthereumConfig>

export async function startEthereumMonitor(village: EthereumVillage, config: OptionalMonitorConfig) {
  try {
    const defaults = {
      minConfirmations: 12
    }
    const appliedConfig = Object.assign({}, defaults, config)

    const model = village.model
    const ethereumConfig = village.config.ethereum
    const client = EthereumBlockReader.createFromConfig(ethereumConfig.client)
    const dao = createEthereumExplorerDao(model)
    const transactionDao = createSingleCurrencyTransactionDao(model)
    console.log('Starting cron')
    const profiler = config.profiling ? new SimpleProfiler() : new EmptyProfiler()
    await scanEthereumExplorerBlocks(dao, client, decodeTokenTransfer, appliedConfig, profiler)
  }
  catch (error) {
    console.error('Ethereum scanning error:', error)
  }
}

export function createEthereumVillage(config: EthereumConfig): Promise<EthereumVillage> {
  return createVillage(getEthereumExplorerSchema(), config)
}