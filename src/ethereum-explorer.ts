import {Model, TransactionToSave} from "./deposit-monitor-manager"
import {AddressIdentityDelegate, BaseAddress, MonitorDao, TransactionDao} from "./types"
import {createLastBlockDao, setStatus} from "./monitor-dao"
import {Modeler} from "vineyard-ground/source/modeler"
import {Collection} from "vineyard-ground/source/collection"
import { blockchain } from "vineyard-blockchain"
import {scanBlocksStandard} from "./monitor-logic"
import { blockchain } from "vineyard-blockchain/src/blockchain";

export async function listPendingSingleCurrencyTransactions(ground: Modeler,
                                                            maxBlockIndex: number): Promise<blockchain.SingleTransaction[]> {
  const sql = `
    SELECT transactions.* FROM transactions
    JOIN blocks ON blocks.id = transactions.block
    AND blocks.index < :maxBlockIndex
    WHERE status = 0`

  return await ground.query(sql, {
    maxBlockIndex: maxBlockIndex
  })
}

export async function saveSingleCurrencyBlock(blockCollection: Collection<blockchain.Block>,
                                              block: blockchain.Block): Promise<blockchain.Block> {
  const filter = block.hash
    ? {hash: block.hash}
    : {index: block.index}

  const existing = await blockCollection.first(filter)
  if (existing)
    return existing

  return await blockCollection.create({
    hash: block.hash,
    index: block.index,
    timeMined: block.timeMined
  })
}

export async function getTransactionByTxid(transactionCollection: Collection<blockchain.SingleTransaction>,
                                           txid: string): Promise<blockchain.SingleTransaction | undefined> {
  return await transactionCollection.first(
    {
      txid: txid
    }).exec()
}

export async function getOrCreateAddressReturningId<Identity>(addressCollection: Collection<BaseAddress<Identity>>,
                                                              externalAddress: string): Promise<Identity> {
  const internalAddress = await addressCollection.first({address: externalAddress})
  return internalAddress
    ? internalAddress.id
    : (await addressCollection.create({address: externalAddress})).id
}

export async function saveSingleCurrencyTransaction<AddressIdentity, BlockIdentity>(transactionCollection: Collection<blockchain.SingleTransaction>,
                                                                                    getOrCreateAddress: AddressIdentityDelegate<AddressIdentity>,
                                                                                    transaction: TransactionToSave): Promise<blockchain.SingleTransaction> {
  const to = transaction.to ? (await getOrCreateAddress(transaction.to)) : undefined
  const from = transaction.from ? (await getOrCreateAddress(transaction.from)) : undefined
  const data: Partial<blockchain.SingleTransaction> = {
    txid: transaction.txid,
    amount: transaction.amount,
    to: to,
    from: from,
    timeReceived: transaction.timeReceived,
    status: transaction.status,
    block: transaction.block,
  }

  return await transactionCollection.create(data)
}

export function createSingleCurrencyTransactionDao(model: Model): TransactionDao {
  const ground = model.ground
  const getOrCreateAddress = getOrCreateAddressReturningId.bind(null, model.Address)
  return {
    getTransactionByTxid: getTransactionByTxid.bind(null, model.Transaction),
    saveTransaction: saveSingleCurrencyTransaction.bind(null, model.Transaction, getOrCreateAddress),
    setStatus: setStatus.bind(null, model.Transaction),
    listPendingTransactions: listPendingSingleCurrencyTransactions.bind(null, ground),
  }
}

export function createEthereumExplorerDao(model: Model): MonitorDao {
  return {
    blockDao: {
      saveBlock: saveSingleCurrencyBlock.bind(null, model.Block)
    },
    lastBlockDao: createLastBlockDao(model),
    transactionDao: createSingleCurrencyTransactionDao(model)
  }
}

export function scanEthereumExplorerBlocks(dao: MonitorDao, client: blockchain.ReadClient<blockchain.SingleTransaction>) {
  const ethereumCurrency = {id: 1, name: "ethereum"}
  return scanBlocksStandard(dao, client,
    (t: blockchain.SingleTransaction) => Promise.resolve(true),
    (t: blockchain.SingleTransaction) => Promise.resolve(t),
    0, ethereumCurrency.id)
}