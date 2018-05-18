import { EmptyProfiler, Profiler } from "../utility";
import { flatMap } from "../utility/index";
import { AddressMap, getOrCreateAddresses2, saveBlocks } from "../database-functions";
import { blockchain } from "vineyard-blockchain"
import { MonitorConfig } from "../ethereum-explorer";
import { createBlockQueue, scanBlocks } from "../monitor-logic";
import { CREATE_TX, CREATE_TX_IN, CREATE_TX_OUT } from "./sql-helpers"
import { BitcoinMonitorDao, TxIn } from "./bitcoin-model"
import { isNullOrUndefined } from "util"
import { Modeler } from "vineyard-data/legacy";

type FullBlock = blockchain.FullBlock<blockchain.MultiTransaction>
export type MultiTransactionBlockClient = blockchain.BlockReader<blockchain.FullBlock<blockchain.MultiTransaction>>

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

async function saveTransactionInputs(ground: any, inputs: AssociatedInput[]): Promise<void> {
  if (inputs.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "txins" ("transaction", "index", "sourceTransaction", "sourceIndex", "scriptSigHex", "scriptSigAsm", "sequence", "coinbase", "created", "modified") VALUES\n'
  const transactionClauses: string[] = inputs.map(
    association => CREATE_TX_IN(association)
  )
  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "sourceTransaction", "sourceIndex";'
  await ground.query(sql)
}

async function saveTransactionOutputs(ground: any, outputs: AssociatedOutput[], addresses: AddressMap): Promise<void> {
  if (outputs.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "txouts" ("transaction", "index", "scriptPubKeyHex", "scriptPubKeyAsm", "address", "amount", "created", "modified") VALUES\n'
  const transactionClauses: string[] = outputs.map(
    association => CREATE_TX_OUT(association, addresses[association.output.address])
  )

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  await ground.querySingle(sql)
}

async function saveTransactions(ground: any, transactions: blockchain.MultiTransaction[]): Promise<void> {
  if (transactions.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
  const transactionClauses: string[] = transactions.map(CREATE_TX)
  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  await ground.querySingle(sql)
}

function gatherAddresses(outputs: AssociatedOutput[]): string[] {
  return [...new Set(outputs.map(o => o.output.address))]
}

async function saveFullBlocks(ground: Modeler, blocks: FullBlock[]): Promise<void> {

  if (blocks.length === 0)
    return

  // Can save to sortedBlocks var and set lasBlockIndex
  const transactions = flatMap(blocks, b => b.transactions)
  const inputs = flatMap(transactions, mapTransactionInputs)
  const outputs = flatMap(transactions, mapTransactionOutputs)
  const addresses = gatherAddresses(outputs)

  const addressesFromDb = await getOrCreateAddresses2(ground, addresses)
  await saveTransactions(ground, transactions)

  await Promise.all([
      saveBlocks(ground, blocks),
      // Add param for oldest block being saved
      saveTransactionInputs(ground, inputs),
      saveTransactionOutputs(ground, outputs, addressesFromDb)
    ]
  )
}

export async function scanBitcoinExplorerBlocks(dao: BitcoinMonitorDao,
                                                client: MultiTransactionBlockClient,
                                                config: MonitorConfig,
                                                profiler: Profiler = new EmptyProfiler()): Promise<any> {

  const blockQueue = await createBlockQueue(dao.lastBlockDao, client, config.queue, config.minConfirmations, 1)
  const saver = (blocks: FullBlock[]) => saveFullBlocks(dao.ground, blocks)
  return scanBlocks(blockQueue, saver, dao.ground, dao.lastBlockDao, config, profiler)
}
