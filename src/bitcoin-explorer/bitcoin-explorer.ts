import { EmptyProfiler, Profiler } from "../utility";
import { flatMap } from "../utility/index";
import { AddressMap, getOrCreateAddresses2, saveBlocks } from "../database-functions";
import { blockchain } from "vineyard-blockchain"
import { MonitorDao } from "../types";
import { Modeler } from "vineyard-data/legacy"
import { MonitorConfig } from "../ethereum-explorer";
import { createBlockQueue, scanBlocks } from "../monitor-logic";
import { CREATE_TX, CREATE_TX_IN, CREATE_TX_OUT } from "./sql-helpers"
import MultiTransaction = blockchain.MultiTransaction

export async function scanBitcoinExplorerBlocks(dao: BitcoinMonitorDao,
                                                client: MultiTransactionBlockClient,
                                                config: MonitorConfig,
                                                profiler: Profiler = new EmptyProfiler()): Promise<any> {

  const blockQueue = await createBlockQueue(dao.lastBlockDao, client, config.queue)
  const saver = (blocks: FullBlock[]) => saveFullBlocks(dao, blocks)
  return scanBlocks(blockQueue, saver, config, profiler)
}

async function saveFullBlocks(dao: BitcoinMonitorDao, blocks: FullBlock[]): Promise<void> {
  const { ground } = dao

  const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index
  const transactions = flatMap(blocks, b => b.transactions)
  const inputs = flatMap(transactions, mapTransactionInputs)
  const outputs = flatMap(transactions, mapTransactionOutputs).filter(o => o.output.scriptPubKey.addresses)

  const addresses = gatherAddresses(inputs, outputs)
  const addressesFromDb = await getOrCreateAddresses2(ground, addresses)

  await Promise.all([
      saveBlocks(ground, blocks),
      dao.lastBlockDao.setLastBlock(lastBlockIndex),
      await saveTransactions(ground, transactions),
      await saveTransactionInputs(ground, inputs, addressesFromDb),
      await saveTransactionOutputs(ground, outputs, addressesFromDb)
    ]
  )

  console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex)
}

async function saveTransactions(ground: any, transactions: blockchain.MultiTransaction[]): Promise<void> {
  if (transactions.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
  const transactionClauses: string[] = transactions.map(CREATE_TX)
  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  await ground.querySingle(sql)
}

async function saveTransactionInputs(ground: any, inputs: AssociatedInput[], addresses: AddressMap): Promise<void> {
  if (inputs.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "txins" ("transaction", "index", "sourceTransaction", "sourceIndex", "scriptSigHex", "scriptSigAsm", "sequence", "address", "amount", "valueSat", "coinbase", "created", "modified") VALUES\n'
  const transactionClauses: string[] = inputs.map(
    association => CREATE_TX_IN(association, addresses[association.input.address || 'NOT_FOUND'])
  )

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  await ground.querySingle(sql)
}

async function saveTransactionOutputs(ground: any, outputs: AssociatedOutput[], addresses: AddressMap): Promise<void> {
  if (outputs.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "txouts" ("transaction", "index", "scriptPubKeyHex", "scriptPubKeyAsm", "address", "amount", "spentTxId", "spentHeight", "spentIndex", "created", "modified") VALUES\n'
  const transactionClauses: string[] = outputs.map(
    association => CREATE_TX_OUT(association, addresses[association.output.scriptPubKey.addresses[0]])
  )

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  await ground.querySingle(sql)
}

function gatherAddresses(inputs: AssociatedInput[], outputs: AssociatedOutput[]): string[] {
  const outputAddresses = flatMap(outputs, o => o.output.scriptPubKey.addresses)
  const inputAddresses = inputs.filter(i => i.input.address).map(i => i.input.address as string)
  return [...new Set([...outputAddresses, ...inputAddresses])]
}

export interface AssociatedInput {
  txid: string
  index: number
  input: blockchain.TransactionInput
}

export interface AssociatedOutput {
  txid: string
  index: number
  output: blockchain.TransactionOutput
}

function mapTransactionInputs(transaction: blockchain.MultiTransaction): AssociatedInput[] {
  return transaction.inputs.map((input, index) => ({
    txid: transaction.txid,
    index: index,
    input: input
  }))
}

function mapTransactionOutputs(transaction: blockchain.MultiTransaction): AssociatedOutput[] {
  return transaction.outputs.map((output, index) => ({
    txid: transaction.txid,
    index: index,
    output: output
  }))
}

type FullBlock = blockchain.FullBlock<blockchain.MultiTransaction>
export type MultiTransactionBlockClient = blockchain.BlockReader<blockchain.FullBlock<blockchain.MultiTransaction>>

export interface BitcoinMonitorDao extends MonitorDao {
  ground: Modeler
}