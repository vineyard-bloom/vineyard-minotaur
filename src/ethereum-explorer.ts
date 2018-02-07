import { AddressIdentityDelegate, BaseBlock, LastBlock, MonitorDao, TransactionDao } from "./types"
import { createIndexedLastBlockDao, setStatus } from "./monitor-dao"
import { Modeler } from "vineyard-ground/source/modeler"
import { Collection } from "vineyard-ground/source/collection"
import { blockchain } from "vineyard-blockchain"
import BigNumber from "bignumber.js"

export interface EthereumTransaction extends blockchain.BlockTransaction {
  to?: number
  from?: number
}

export interface Address {
  id: number
  address: string
  balance: BigNumber
}

export interface EthereumModel {
  Address: Collection<Address>
  Block: Collection<blockchain.Block>
  Transaction: Collection<EthereumTransaction>
  LastBlock: Collection<LastBlock>

  ground: Modeler
}

export async function saveSingleCurrencyBlock(blockCollection: Collection<blockchain.Block>,
                                              block: blockchain.Block): Promise<void> {

  const existing = await blockCollection.first({ index: block.index })
  if (existing)
    return

  await blockCollection.create(block)
}

export function getTransactionByTxid(transactionCollection: Collection<blockchain.SingleTransaction>,
                                     txid: string): Promise<blockchain.SingleTransaction | undefined> {
  return transactionCollection.first({ txid: txid }).exec()
}

export async function getOrCreateAddressReturningId(addressCollection: Collection<Address>,
                                                    externalAddress: string): Promise<number> {
  const internalAddress = await addressCollection.first({ address: externalAddress })
  return internalAddress
    ? internalAddress.id
    : (await addressCollection.create({ address: externalAddress })).id
}

export async function saveSingleCurrencyTransaction(transactionCollection: Collection<EthereumTransaction>,
                                                    getOrCreateAddress: AddressIdentityDelegate<number>,
                                                    transaction: blockchain.SingleTransaction): Promise<void> {
  const to = transaction.to ? (await getOrCreateAddress(transaction.to)) : undefined
  const from = transaction.from ? (await getOrCreateAddress(transaction.from)) : undefined
  const data: EthereumTransaction = {
    txid: transaction.txid,
    amount: transaction.amount,
    to: to,
    from: from,
    timeReceived: transaction.timeReceived,
    status: transaction.status,
    blockIndex: transaction.blockIndex,
  }

  await transactionCollection.create(data)
}

export function createSingleCurrencyTransactionDao(model: EthereumModel): TransactionDao {
  const getOrCreateAddress = (externalAddress: string) => getOrCreateAddressReturningId(model.Address, externalAddress)
  return {
    getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
    saveTransaction: (transaction: blockchain.SingleTransaction) => saveSingleCurrencyTransaction(model.Transaction, getOrCreateAddress, transaction),
    setStatus: setStatus.bind(null, model.Transaction)
  }
}

export function createEthereumExplorerDao(model: EthereumModel): MonitorDao {
  return {
    blockDao: {
      saveBlock: (block: BaseBlock) => saveSingleCurrencyBlock(model.Block, block)
    },
    lastBlockDao: createIndexedLastBlockDao(model.ground, 2),
    transactionDao: createSingleCurrencyTransactionDao(model)
  }
}

export type EthereumBlockClient = blockchain.BlockClient<blockchain.SingleTransaction>

interface Profile {
  samples: number[][]
  timer: any
}

function getAverage(values: number[]) {
  let sum = 0
  for (let value of values) {
    sum += value / values.length
  }
  return sum
}

class Profiler {
  private profiles: { [key: string]: Profile } = {}
  private previous: string = ''

  start(name: string) {
    const profile = this.profiles[name] = (this.profiles[name] || { samples: [] })
    profile.timer = process.hrtime()
    this.previous = name
  }

  stop(name: string = this.previous) {
    const profile = this.profiles[name]
    profile.samples.push(process.hrtime(profile.timer))
    profile.timer = undefined
  }

  next(name: string) {
    this.stop(this.previous)
    this.start(name)
  }

  private formatAverage(samples: number[][], index: number) {
    const average = Math.round(getAverage(samples.map(t => t[index]))).toString()
    return (average as any).padStart(16, ' ')
  }

  log() {
    console.log('Profile results:')
    for (let i in this.profiles) {
      const profile = this.profiles[i]
      const average1 = this.formatAverage(profile.samples, 0)
      const average2 = this.formatAverage(profile.samples, 1)
      console.log(' ', (i.toString() as any).padStart(30, ' '), average1, average2)
    }
  }
}

export async function scanEthereumExplorerBlocksProfiled(dao: MonitorDao, client: EthereumBlockClient): Promise<any> {
  const lastBlockIndex = await dao.lastBlockDao.getLastBlock()
  let blockIndex = typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0
  const initial = blockIndex
  const profiler = new Profiler()
  do {
    profiler.start('getBlockInfo')
    const block = await client.getBlockInfo(blockIndex)
    if (!block)
      return

    profiler.next('getBlockTransactions')
    const transactions = await client.getBlockTransactions(block)
    profiler.next('saveBlock')
    await dao.blockDao.saveBlock(block)
    profiler.next('saveTransactions')
    for (let transaction of transactions) {
      await dao.transactionDao.saveTransaction(transaction)
    }
    profiler.next('setLastBlock')
    await dao.lastBlockDao.setLastBlock(block.index)
    profiler.stop()
    blockIndex = block.index + 1
  } while (blockIndex < initial + 10)
  profiler.log()
  process.exit()
}

export async function scanEthereumExplorerBlocks(dao: MonitorDao, client: EthereumBlockClient): Promise<any> {
  const lastBlockIndex = await dao.lastBlockDao.getLastBlock()
  let blockIndex = typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0
  do {
    const block = await client.getBlockInfo(blockIndex)
    if (!block)
      break

    const transactions = await client.getBlockTransactions(block)
    dao.blockDao.saveBlock(block)
    for (let transaction of transactions) {
      dao.transactionDao.saveTransaction(transaction)
    }
    blockIndex = block.index + 1
  } while (true)

  await dao.lastBlockDao.setLastBlock(blockIndex - 1)
}