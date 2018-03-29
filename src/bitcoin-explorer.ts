import { ExternalBlockQueue } from "./block-queue";
import { EmptyProfiler, Profiler } from "./utility";
import { flatMap } from "./utility/index";
import { AddressMap, getNextBlock, getOrCreateAddresses, saveBlocks } from "./database-functions";
import { blockchain } from "vineyard-blockchain"
import { MonitorDao } from "./types";
import { Modeler } from "vineyard-data/legacy"
import { MonitorConfig } from "./ethereum-explorer";

type FullBlock = blockchain.FullBlock<blockchain.MultiTransaction>

export type MultiTransactionBlockClient = blockchain.BlockReader<blockchain.MultiTransaction>

export interface BitcoinMonitorDao extends MonitorDao {
  ground: Modeler
}

function gatherAddresses(blocks: FullBlock[]) {
  const addresses: AddressMap = {}
  for (let block of blocks) {
    for (let transaction of block.transactions) {
      for (let output of transaction.outputs) {
        addresses[output.address] = -1
      }
    }
  }

  return addresses
}

function saveTransactions(ground: any, transactions: blockchain.MultiTransaction[], addresses: AddressMap) {
  if (transactions.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
  const transactionClauses: string[] = transactions.map(t => {
    // const to = t.to ? addresses[t.to] : 'NULL'
    // const from = t.from ? addresses[t.from] : 'NULL'
    return `(${t.status}, '${t.txid}', ${t.fee}, ${t.nonce}, 2, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`
  })

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

async function saveFullBlocks(dao: BitcoinMonitorDao, decodeTokenTransfer: blockchain.EventDecoder, blocks: FullBlock[]): Promise<void> {
  const ground = dao.ground
  const transactions = flatMap(blocks, b => b.transactions)

  const addresses = gatherAddresses(blocks)
  const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index

  await Promise.all([
      saveBlocks(ground, blocks),
      dao.lastBlockDao.setLastBlock(lastBlockIndex),
      getOrCreateAddresses(dao.ground, addresses)
        .then(() => saveTransactions(ground, transactions, addresses))
    ]
  )

  console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex)
}

export async function scanBitcoinExplorerBlocks(dao: BitcoinMonitorDao,
                                                 client: MultiTransactionBlockClient,
                                                 decodeTokenTransfer: blockchain.EventDecoder,
                                                 config: MonitorConfig,
                                                 profiler: Profiler = new EmptyProfiler()): Promise<any> {
  let blockIndex = await getNextBlock(dao.lastBlockDao)
  const blockQueue = new ExternalBlockQueue(client, blockIndex, config.queue)
  const startTime: number = Date.now()
  do {
    const elapsed = Date.now() - startTime
    // console.log('Scanning block', blockIndex, 'elapsed', elapsed)
    if (config.maxMilliseconds && elapsed > config.maxMilliseconds) {
      console.log('Reached timeout of ', elapsed, 'milliseconds')
      console.log('Canceled blocks', blockQueue.requests.map(b => b.blockIndex).join(', '))
      break
    }

    profiler.start('getBlocks')
    const blocks = await blockQueue.getBlocks()
    profiler.stop('getBlocks')
    if (blocks.length == 0) {
      console.log('No more blocks found.')
      break
    }

    console.log('Saving blocks', blocks.map(b => b.index).join(', '))

    profiler.start('saveBlocks')
    await saveFullBlocks(dao, decodeTokenTransfer, blocks)
    profiler.stop('saveBlocks')

    // console.log('Saved blocks', blocks.map(b => b.index))
  }
  while (true)

}