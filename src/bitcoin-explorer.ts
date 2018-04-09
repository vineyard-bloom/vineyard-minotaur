import { ExternalBlockQueue } from "./block-queue";
import { EmptyProfiler, Profiler } from "./utility";
import { flatMap } from "./utility/index";
import {
  addressesAreAssociated, AddressMap, getNextBlock, getOrCreateAddresses,
  saveBlocks
} from "./database-functions";
import { blockchain } from "vineyard-blockchain"
import { MonitorDao } from "./types";
import { Modeler } from "vineyard-data/legacy"
import { MonitorConfig } from "./ethereum-explorer";
import { createBlockQueue, scanBlocks } from "./monitor-logic";

type FullBlock = blockchain.FullBlock<blockchain.MultiTransaction>

export type MultiTransactionBlockClient = blockchain.BlockReader<blockchain.FullBlock<blockchain.MultiTransaction>>

export interface BitcoinMonitorDao extends MonitorDao {
  ground: Modeler
}

function gatherAddresses(blocks: FullBlock[]) {
  const addresses: AddressMap = {}
  for (let block of blocks) {
    for (let transaction of block.transactions) {
      for (let output of transaction.outputs) {
        addresses[output.scriptPubKey.addresses[0]] = -1
      }
    }
  }

  return addresses
}

async function saveTransactions(ground: any, transactions: blockchain.MultiTransaction[], addresses: AddressMap) {
  if (!addressesAreAssociated(addresses))
    throw new Error("Not all addresses were properly saved or loaded")

  if (transactions.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "transactions" ("status", "txid", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
  const transactionClauses: string[] = transactions.map(t => {
    return `(${t.status}, '${t.txid}', ${t.fee}, ${t.nonce}, 1, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`
  })

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  await ground.querySingle(sql)

  const inputs = flatMap(transactions, mapTransactionInputs)
  const outputs = flatMap(transactions, mapTransactionOutputs)

  await saveTransactionInputs(ground, inputs, addresses)
  await saveTransactionOutputs(ground, outputs, addresses)
}

interface AssociatedInput {
  txid: string
  index: number
  input: blockchain.TransactionInput
}

interface AssociatedOutput {
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

function selectTxidClause(txid: string) {
  return `(SELECT tx.id FROM transactions tx WHERE tx.txid = '${txid}')`
}

function nullify(value: any) {
  return (value === undefined || value === null) ? 'NULL' : value
}

function nullifyString(value: string | undefined | null) {
  return (value === undefined || value === null) ? 'NULL' : "'" + value + "'"
}

function saveTransactionInputs(ground: any, inputs: AssociatedInput[], addresses: AddressMap) {
  if (inputs.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "txins" ("transaction", "index", "sourceTransaction", "sourceIndex", "scriptSigHex", "scriptSigAsm", "sequence", "address", "amount", "valueSat", "coinbase", "created", "modified") VALUES\n'
  const transactionClauses: string[] = inputs.map(association => {
    const input = association.input
    return `(${selectTxidClause(association.txid)}, '${association.index}', ${input.txid ? selectTxidClause(input.txid) : 'NULL'}, ${nullify(input.vout)}, ${input.scriptSig ? "'" + input.scriptSig.hex + "'": 'NULL'}, ${input.scriptSig ? "'" + input.scriptSig.asm + "'" : 'NULL'}, ${input.sequence}, ${input.address ? addresses[input.address] : 'NULL'}, ${nullify(input.amount)}, ${nullify(input.valueSat)}, ${nullifyString(input.coinbase)},  NOW(), NOW())`
  })

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

function saveTransactionOutputs(ground: any, outputs: AssociatedOutput[], addresses: AddressMap) {
  if (outputs.length == 0)
    return Promise.resolve()

  const header = 'INSERT INTO "txouts" ("transaction", "index", "scriptPubKeyHex", "scriptPubKeyAsm", "address", "amount", "spentTxId", "spentHeight", "spentIndex", "created", "modified") VALUES\n'
  const transactionClauses: string[] = outputs.map(association => {
    const output = association.output
    return `(${selectTxidClause(association.txid)}, ${association.index}, '${output.scriptPubKey.hex}', '${output.scriptPubKey.asm}', '${addresses[output.scriptPubKey.addresses[0]]}', ${output.value}, ${nullifyString(output.spentTxId)}, ${nullify(output.spentHeight)}, ${nullify(output.spentIndex)},  NOW(), NOW())`
  })

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

async function saveFullBlocks(dao: BitcoinMonitorDao, blocks: FullBlock[]): Promise<void> {
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
                                                config: MonitorConfig,
                                                profiler: Profiler = new EmptyProfiler()): Promise<any> {

  const blockQueue = await createBlockQueue(dao.lastBlockDao, client, config.queue)
  const saver = (blocks: FullBlock[]) => saveFullBlocks(dao, blocks)
  return scanBlocks(blockQueue, saver, config, profiler)

  // let blockIndex = await getNextBlock(dao.lastBlockDao)
  // const blockQueue = new ExternalBlockQueue(client, blockIndex, config.queue)
  // const startTime: number = Date.now()
  // do {
  //   const elapsed = Date.now() - startTime
  //   // console.log('Scanning block', blockIndex, 'elapsed', elapsed)
  //   if (config.maxMilliseconds && elapsed > config.maxMilliseconds) {
  //     console.log('Reached timeout of ', elapsed, 'milliseconds')
  //     console.log('Canceled blocks', blockQueue.requests.map(b => b.blockIndex).join(', '))
  //     break
  //   }
  //
  //   profiler.start('getBlocks')
  //   const blocks = await blockQueue.getBlocks()
  //   profiler.stop('getBlocks')
  //   if (blocks.length == 0) {
  //     console.log('No more blocks found.')
  //     break
  //   }
  //
  //   console.log('Saving blocks', blocks.map(b => b.index).join(', '))
  //
  //   profiler.start('saveBlocks')
  //   await saveFullBlocks(dao, blocks)
  //   profiler.stop('saveBlocks')
  //
  //   // console.log('Saved blocks', blocks.map(b => b.index))
  // }
  // while (true)

}