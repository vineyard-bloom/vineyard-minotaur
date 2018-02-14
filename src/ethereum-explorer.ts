import { BaseBlock, LastBlock, LastBlockDao, MonitorDao, TransactionDao } from "./types"
import { createIndexedLastBlockDao, setStatus } from "./monitor-dao"
import { Modeler } from "vineyard-ground/source/modeler"
import { Collection } from "vineyard-ground/source/collection"
import { blockchain } from "vineyard-blockchain"
import BigNumber from "bignumber.js"
import { EmptyProfiler, Profiler } from "./profiler";
import { ExternalBlockQueue, FullBlock, SingleTransactionBlockClient } from "./block-queue";

export interface EthereumTransaction extends blockchain.BlockTransaction {
  to?: number
  from?: number
}

export interface Address {
  id: number
  address: string
  balance: BigNumber
}

export interface Currency {
  id: number
  address?: number
  name: string
}

export type AddressDelegate = (externalAddress: string) => Promise<number>

export interface EthereumModel {
  Address: Collection<Address>
  Currency: Collection<Currency>
  Block: Collection<blockchain.Block>
  Transaction: Collection<EthereumTransaction>
  LastBlock: Collection<LastBlock>

  ground: Modeler
}

export interface EthereumMonitorDao extends MonitorDao {
  getOrCreateAddress: AddressDelegate,
  ground: Modeler
}

export async function saveSingleCurrencyBlock(blockCollection: Collection<blockchain.Block>,
                                              block: blockchain.Block): Promise<void> {

  const existing = await blockCollection.first({ index: block.index })
  if (existing)
    return

  await blockCollection.create(block)
}

export function getTransactionByTxid<Tx>(transactionCollection: Collection<Tx>,
                                         txid: string): Promise<Tx | undefined> {
  return transactionCollection.first({ txid: txid }).exec()
}

export async function getOrCreateAddressReturningId(addressCollection: Collection<Address>,
                                                    externalAddress: string): Promise<number> {
  const internalAddress = await addressCollection.first({ address: externalAddress })
  return internalAddress
    ? internalAddress.id
    : (await addressCollection.create({ address: externalAddress })).id
}

export function createSingleCurrencyTransactionDao(model: EthereumModel): TransactionDao<EthereumTransaction> {
  return {
    getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
    saveTransaction: async (transaction: EthereumTransaction) => {
      await model.Transaction.create(transaction)
    },
    setStatus: setStatus.bind(null, model.Transaction)
  }
}

export function createEthereumExplorerDao(model: EthereumModel): EthereumMonitorDao {
  return {
    blockDao: {
      saveBlock: (block: BaseBlock) => saveSingleCurrencyBlock(model.Block, block)
    },
    lastBlockDao: createIndexedLastBlockDao(model.ground, 2),
    // transactionDao: createSingleCurrencyTransactionDao(model),
    getOrCreateAddress: (externalAddress: string) => getOrCreateAddressReturningId(model.Address, externalAddress),
    ground: model.ground
  }
}

export interface MonitorConfig {
  maxConsecutiveBlocks?: number,
  maxMilliseconds?: number,
  maxBlocksPerScan?: number
}

export async function getNextBlock(lastBlockDao: LastBlockDao) {
  const lastBlockIndex = await lastBlockDao.getLastBlock()
  return typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0
}

type AddressMap = { [key: string]: number }

function gatherAddresses(blocks: FullBlock[], contracts: blockchain.Contract[]) {
  const addresses: AddressMap = {}
  for (let block of blocks) {
    for (let transaction of block.transactions) {
      if (transaction.to)
        addresses [transaction.to] = -1

      if (transaction.from)
        addresses [transaction.from] = -1
    }
  }
  for (let contract of contracts) {
    addresses[contract.address] = -1
  }

  return addresses
}

async function setAddress(getOrCreateAddress: AddressDelegate, addresses: AddressMap, key: string) {
  const id = await getOrCreateAddress(key)
  addresses[key] = id
}

function saveTransactions(ground: any, blocks: FullBlock[], addresses: AddressMap) {
  let transactionClauses: string[] = []
  for (let block of blocks) {
    transactionClauses = transactionClauses.concat(
      block.transactions.map(t => {
        const to = t.to ? addresses[t.to] : 'NULL'
        const from = t.from ? addresses[t.from] : 'NULL'
        return `(${t.status}, '${t.txid}', ${to}, ${from}, ${t.amount}, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`
      })
    )
  }

  if (transactionClauses.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "transactions" ("status", "txid", "to", "from", "amount", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

async function getOrCreateAddresses(ground: Modeler, addresses: AddressMap) {
  {
    const addressClauses: string [] = []
    for (let i in addresses) {
      addressClauses.push(`'${i}'`)
    }
    if (addressClauses.length == 0)
      return Promise.resolve()

    const header = `SELECT "id", "address" FROM addresses
  WHERE "address" IN (
  `
    const sql = header + addressClauses.join(',\n') + ');'
    const rows = await ground.query(sql)
    for (let row of rows) {
      addresses[row.address] = parseInt(row.id)
    }
  }
  {
    const inserts: string[] = []
    for (let i in addresses) {
      const value = addresses[i]
      if (value === -1) {
        inserts.push(`('${i}', NOW(), NOW())`)
      }
    }
    if (inserts.length == 0)
      return Promise.resolve()

    const insertHeader = 'INSERT INTO "addresses" ("address", "created", "modified") VALUES\n'
    const sql = insertHeader + inserts.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";'
    const rows = await ground.query(sql)
    for (let row of rows) {
      addresses[row.address] = parseInt(row.id)
    }
  }
}

async function saveBlocks(ground: Modeler, blocks: blockchain.Block[]) {
  const header = 'INSERT INTO "blocks" ("index", "hash", "timeMined", "created", "modified") VALUES\n'
  let inserts: string[] = []
  for (let block of blocks) {
    inserts.push(`(${block.index}, '${block.hash}', '${block.timeMined.toISOString()}', NOW(), NOW())`)
  }

  const sql = header + inserts.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

async function saveContracts(ground: Modeler, contracts: blockchain.Contract[], addresses: AddressMap): Promise<Currency[]> {
  if (contracts.length == 0)
    return Promise.resolve([])

  let contractClauses: string[] = contracts.map(contract => {
    return `(${addresses[contract.address]}, '${contract.name}', NOW(), NOW())`
  })

  const header = 'INSERT INTO "currencies" ("address", "name", "created", "modified") VALUES\n'
  const sql = header + contractClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

function gatherNewContracts(blocks: FullBlock[]): blockchain.Contract[] {
  let result: blockchain.Contract[] = []
  for (let block of blocks) {
    result = result.concat(
      block.transactions
        .filter(t => t.newContract)
        .map(t => t.newContract as blockchain.Contract)
    )
  }
  return result
}

async function saveFullBlocks(dao: EthereumMonitorDao, blocks: FullBlock[]): Promise<void> {
  const contracts = gatherNewContracts(blocks)
  const addresses = gatherAddresses(blocks, contracts)
  const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index

  await Promise.all([
      saveBlocks(dao.ground, blocks),
      dao.lastBlockDao.setLastBlock(lastBlockIndex),
    getOrCreateAddresses(dao.ground, addresses)
        .then(() => saveContracts(dao.ground, contracts, addresses))
        .then(() => saveTransactions(dao.ground, blocks, addresses))
    ]
  )

  console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex)
}

export async function scanEthereumExplorerBlocks(dao: EthereumMonitorDao,
                                                 client: SingleTransactionBlockClient,
                                                 config: MonitorConfig,
                                                 profiler: Profiler = new EmptyProfiler()): Promise<any> {
  let blockIndex = await getNextBlock(dao.lastBlockDao)
  const blockQueue = new ExternalBlockQueue(client, blockIndex, config.maxConsecutiveBlocks)
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
    if (blocks.length == 0)
      break

    console.log('Saving blocks', blocks.map(b => b.index).join(', '))

    profiler.start('saveBlocks')
    await saveFullBlocks(dao, blocks)
    profiler.stop('saveBlocks')

    // console.log('Saved blocks', blocks.map(b => b.index))
  }
  while (true)

  // blockQueue.p.logFlat()
  profiler.logFlat()
}