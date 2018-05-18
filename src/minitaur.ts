import { createBlockQueue, scanBlocks } from "./monitor-logic";
import { EthereumMonitorDao, MonitorConfig, SingleTransactionBlockClient } from "./ethereum-explorer";
import { EmptyProfiler, Profiler } from "./utility";
import { blockchain } from "vineyard-blockchain"
import { flatMap } from "./utility/index";
import { AddressMap, getOrCreateAddresses, saveBlocks, saveSingleTransactions } from "./database-functions";

type FullBlock = blockchain.FullBlock<blockchain.ContractTransaction>

function gatherAddresses(blocks: FullBlock[]) {
  const addresses: AddressMap = {}
  for (let block of blocks) {
    for (let transaction of block.transactions) {
      if (transaction.to)
        addresses [transaction.to] = -1

      if (transaction.from)
        addresses [transaction.from] = -1
    }
  }

  return addresses
}

async function saveFullBlocks(dao: EthereumMonitorDao, blocks: FullBlock[]): Promise<void> {
  const ground = dao.ground
  const transactions = flatMap(blocks, b => b.transactions)

  const addresses = gatherAddresses(blocks)
  const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index

  await Promise.all([
      saveBlocks(ground, blocks),
      dao.lastBlockDao.setLastBlock(lastBlockIndex),
      getOrCreateAddresses(dao.ground, addresses)
        .then(() => saveSingleTransactions(ground, transactions, addresses))
    ]
  )

  console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex)
}

export async function scanMiniBlocks(dao: EthereumMonitorDao,
                                     client: SingleTransactionBlockClient,
                                     config: MonitorConfig,
                                     profiler: Profiler = new EmptyProfiler()): Promise<any> {
  const blockQueue = await createBlockQueue(dao.lastBlockDao, client, config.queue, config.minConfirmations, -1) // TODO: Set this to something that works
  const saver = (blocks: FullBlock[]) => saveFullBlocks(dao, blocks)
  return scanBlocks(blockQueue, saver, dao.ground, config, profiler)
}