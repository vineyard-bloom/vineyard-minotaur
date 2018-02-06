import { AddressIdentityDelegate, BaseAddress, BaseBlock, LastBlock, MonitorDao, TransactionDao } from "./types"
import { createLastBlockDao, setStatus } from "./monitor-dao"
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
  const ground = model.ground
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
    lastBlockDao: createLastBlockDao(model.ground),
    transactionDao: createSingleCurrencyTransactionDao(model)
  }
}

export type EthereumBlockClient = blockchain.BlockClient<blockchain.SingleTransaction>

export async function scanEthereumExplorerBlocks(dao: MonitorDao, client: EthereumBlockClient): Promise<any> {
  const lastBlock = await dao.lastBlockDao.getLastBlock()
  let blockIndex = lastBlock ? lastBlock.index + 1 : 0

  do {
    const block = await client.getBlockInfo(blockIndex)
    if (!block)
      return

    const transactions = await client.getBlockTransactions(block)
    await dao.blockDao.saveBlock(block)

    for (let transaction of transactions) {
      await dao.transactionDao.saveTransaction(transaction)
    }

    await dao.lastBlockDao.setLastBlock(block.index)
    blockIndex = block.index + 1
  } while (true)
}