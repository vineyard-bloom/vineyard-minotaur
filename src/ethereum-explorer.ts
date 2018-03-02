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

export interface TokenTransferRecord {

}

export interface EthereumModel {
  Address: Collection<Address>
  Currency: Collection<any>
  Contract: Collection<blockchain.Contract & { id: number }>
  Block: Collection<blockchain.Block>
  Token: Collection<blockchain.TokenContract>
  TokenTransfer: Collection<TokenTransferRecord>
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

interface ContractAddress {
  id: number,
  address: string
}

async function gatherContractToAddresses(ground: Modeler, addresses: string[]): Promise<ContractAddress[]> {
  const addressClause = addresses.map(a => "'" + a + "'").join(',\n')
  const sql = `
  SELECT addresses.id, addresses.address FROM contracts
  JOIN addresses ON addresses.id = contracts.address
  WHERE addresses.address IN (
  ${addressClause}
  )`
  const records: any[] = await ground.query(sql)
  return records.map(r => ({
    id: parseInt(r.id),
    address: r.address
  }))
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
        return `(${t.status}, '${t.txid}', ${to}, ${from}, ${t.amount}, 2, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`
      })
    )
  }

  if (transactionClauses.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "transactions" ("status", "txid", "to", "from", "amount", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
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

async function saveCurrencies(ground: Modeler, tokenContracts: blockchain.Contract[], contractRecords: any[],
                              addresses: AddressMap): Promise<any[]> {
  const tokenClauses: string[] = tokenContracts.map(contract => {
      const token = contract as blockchain.TokenContract
      const address = addresses[contract.address]
      const record = contractRecords.filter((c: any) => c.address === address)[0]
      return `('${token.name}', NOW(), NOW())`
    }
  )

  const sql2 = `
INSERT INTO "currencies" ("name", "created", "modified") 
VALUES ${tokenClauses.join(',\n')} 
RETURNING "id", "name";`

  return ground.query(sql2)
  // return result.map((c: any) => ({
  //   id: parseInt(c.id),
  //   name: c.name
  // }))
}

async function saveContracts(ground: Modeler, contracts: blockchain.Contract[], addresses: AddressMap): Promise<void> {
  if (contracts.length == 0)
    return Promise.resolve()

  const contractClauses: string[] = contracts.map(contract =>
    `(${addresses[contract.address]}, (SELECT transactions.id FROM transactions WHERE txid = '${contract.txid}'), NOW(), NOW())`
  )

  const header = 'INSERT INTO "contracts" ("address", "transaction", "created", "modified") VALUES\n'
  const sql = header + contractClauses.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";'
  const contractRecords = (await ground.query(sql))
    .map((c: any) => ({
      id: parseInt(c.id),
      address: parseInt(c.address)
    }))

  const tokenContracts = contracts.filter(c => c.contractType == blockchain.ContractType.token)
  if (tokenContracts.length == 0)
    return

  const currencies = await saveCurrencies(ground, tokenContracts, contractRecords, addresses)

  {
    const tokenClauses: string[] = tokenContracts.map(contract => {
        const token = contract as blockchain.TokenContract
        const address = addresses[contract.address]
        const contractRecord = contractRecords.filter((c: any) => c.address === address)[0]
        const currency = currencies.filter((c: any) => c.name === token.name)[0]
        return `(${currency.id}, ${contractRecord.id}, '${token.name}', '${token.totalSupply}', '${token.decimals}', 
      '${token.version}', '${token.symbol}', NOW(), NOW())`
      }
    )

    const sql2 = `
INSERT INTO "tokens" ("id", "contract", "name", "totalSupply", "decimals", "version", "symbol", "created", "modified") 
VALUES ${tokenClauses.join(',\n')} 
ON CONFLICT DO NOTHING;`

    await ground.querySingle(sql2)
  }
}

function gatherNewContracts(blocks: FullBlock[]): blockchain.AnyContract[] {
  let result: blockchain.Contract[] = []
  for (let block of blocks) {
    result = result.concat(
      block.transactions
        .filter(t => t.newContract)
        .map(t => t.newContract as blockchain.AnyContract)
    )
  }
  return result
}

// function getTokenTransferContractAddresses(transactions: blockchain.ContractTransaction[]) {
//   const tempMap: any = {}
//   for (let transaction of transactions) {
//     tempMap[transaction.]
//   }
//   return tempMap.keys()
// }

async function saveTokenTransfers(ground: Modeler, events: blockchain.StateEvent[], addresses: AddressMap) {
  let contractAddresses = [...new Set(events.map(e => e.transactionHash))]
  const watchAddresses = await gatherContractToAddresses(ground, contractAddresses)
  if (watchAddresses.length == 0)
    return Promise.resolve()

  return Promise.resolve()
  // transactionClauses: string[] = events.map(t => {
  //   const to = t.to ? addresses[t.to] : 'NULL'
  //   const from = t.from ? addresses[t.from] : 'NULL'
  //   return `(${t.status}, '${t.txid}', ${to}, ${from}, ${t.amount}, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`
  // })
//)

  // if (transactionClauses.length == 0)
  //   return Promise.resolve()
  //
  // const header = 'INSERT INTO "transactions" ("status", "txid", "to", "from", "amount", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
  // const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  // return ground.querySingle(sql)
}

function flatMap<A, B>(array: A[], mapper: (a: A) => B[],) {
  return array.reduce((accumulator: B[], a) =>
    accumulator.concat(mapper(a)), [])
}

async function saveFullBlocks(dao: EthereumMonitorDao, blocks: FullBlock[]): Promise<void> {
  const transactions = flatMap(blocks, b => b.transactions)
  const events = flatMap(transactions, t => t.events || [])

  const contracts = gatherNewContracts(blocks)
  const addresses = gatherAddresses(blocks, contracts)
  const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index
  const ground = dao.ground

  await Promise.all([
      saveBlocks(ground, blocks),
      dao.lastBlockDao.setLastBlock(lastBlockIndex),
      getOrCreateAddresses(dao.ground, addresses)
        .then(() => saveTransactions(ground, blocks, addresses))
        .then(() => saveContracts(ground, contracts, addresses))
        .then(() => saveTokenTransfers(ground, events, addresses))
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

}