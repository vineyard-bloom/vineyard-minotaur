import { EmptyProfiler, Profiler } from "../utility";
import { flatMap } from "../utility/index";
import { AddressMap, getOrCreateAddresses2, saveBlocks } from "../database-functions";
import { blockchain } from "vineyard-blockchain"
import { MonitorConfig } from "../ethereum-explorer";
import { createBlockQueue, scanBlocks, validateBlocks } from "../monitor-logic";
import { CREATE_TX, CREATE_TX_IN, CREATE_TX_OUT } from "./sql-helpers"
import { BitcoinMonitorDao, TxIn } from "./bitcoin-model"
import { isNullOrUndefined } from "util"

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

export enum ScannedBlockStatus { UpToDate, Outdated, Nonexistent }
export async function checkBlockScanStatus(dao: BitcoinMonitorDao, block: { index: number, hash: string }): Promise<ScannedBlockStatus> {
  const { index, hash } = block
  const retrievedBlock = await dao.blockDao.getBlockByIndex(index)
  if(!retrievedBlock) return ScannedBlockStatus.Nonexistent
  if(retrievedBlock.hash !== hash) return ScannedBlockStatus.Outdated
  return ScannedBlockStatus.UpToDate
}

async function saveOrDeleteFullBlocks(dao: BitcoinMonitorDao, blocks: FullBlock[]): Promise<void> {
  const blocksToDelete = []
  const blocksToSave = []

  for (let i=0; i<blocks.length; i++) {
    const blockScanStatus = await checkBlockScanStatus(dao, blocks[i])
    if (blockScanStatus === ScannedBlockStatus.Nonexistent) {
      blocksToSave.push(blocks[i]) 
    }
    else if (blockScanStatus === ScannedBlockStatus.Outdated) { 
      blocksToDelete.push(blocks[i])
      blocksToSave.push(blocks[i])
    }
  }

  // deleteFullBlocks from database-functions.ts
  await saveFullBlocks(dao, blocksToSave)
}

async function saveFullBlocks(dao: BitcoinMonitorDao, blocks: FullBlock[]): Promise<void> {
  const { ground } = dao

  // Can save to sortedBlocks var and set lasBlockIndex
  const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index
  const transactions = flatMap(blocks, b => b.transactions)
  const inputs = flatMap(transactions, mapTransactionInputs)
  const outputs = flatMap(transactions, mapTransactionOutputs)
  const addresses = gatherAddresses(outputs)

  const addressesFromDb = await getOrCreateAddresses2(ground, addresses)
  await saveTransactions(ground, transactions)

  await Promise.all([
      saveBlocks(ground, blocks),
      // Add param for oldest block being saved
      dao.lastBlockDao.setLastBlock(lastBlockIndex),
      saveTransactionInputs(ground, inputs),
      saveTransactionOutputs(ground, outputs, addressesFromDb)
    ]
  )

  console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex)
}

export async function scanBitcoinExplorerBlocks(dao: BitcoinMonitorDao,
                                                client: MultiTransactionBlockClient,
                                                config: MonitorConfig,
                                                profiler: Profiler = new EmptyProfiler()): Promise<any> {

  await validateBlocks(blockStorage)
  const blockQueue = await createBlockQueue(dao.lastBlockDao, client, config.queue)
  const saver = (blocks: FullBlock[]) => saveFullBlocks(dao, blocks)
  return scanBlocks(blockQueue, saver, config, profiler)
}
