import { blockchain } from 'vineyard-blockchain'
import { Modeler } from 'vineyard-data/legacy'
import { LastBlockDao } from "./types";

export type AddressMap = { [key: string]: number }

export async function getOrCreateAddresses(ground: Modeler, addresses: AddressMap): Promise<void> {
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
      addresses[row.address.trim()] = parseInt(row.id)
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
      addresses[row.address.trim()] = parseInt(row.id)
    }
  }
}

export async function getOrCreateAddresses2(ground: Modeler, addresses: string[]): Promise<AddressMap> {
  const existingAddresses = await getExistingAddresses(ground, addresses)
  const newlySavedAddresses = await saveNewAddresses(ground, arrayDiff(addresses, Object.keys(existingAddresses)))
  return { ...existingAddresses, ...newlySavedAddresses }
}

export async function getExistingAddresses(ground: Modeler, addresses: string[]): Promise<AddressMap> {
  const addressMap: AddressMap = {}
  if(addresses.length === 0 ) return addressMap

  const header = `SELECT "id", "address" FROM addresses WHERE "address" IN (`
  const sql = header + addresses.map( add => `'${add}'` ).join(',\n') + ');'

  const rows = await ground.query(sql)
  for (let row of rows) {
    addressMap[row.address.trim()] = parseInt(row.id)
  }
  return addressMap
}

export async function saveNewAddresses(ground: Modeler, addresses: string[]): Promise<AddressMap> {
  const addressMap: AddressMap = {}
  if(addresses.length === 0) return addressMap

  const inserts: string[] = addresses.map(add => `('${add}', NOW(), NOW())`)
  const insertHeader = 'INSERT INTO "addresses" ("address", "created", "modified") VALUES\n'
  const sql = insertHeader + inserts.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";'

  const rows = await ground.query(sql)
  for (let row of rows) {
    addressMap[row.address.trim()] = parseInt(row.id)
  }
  return addressMap
}

export function arrayDiff<T> (a1: T[], a2: T[]): T[] {
  const set2 = new Set(a2)
  return a1.filter(x => !set2.has(x))
}

export async function saveBlocks(ground: Modeler, blocks: blockchain.Block[]) {
  if (blocks.length === 0) {
    throw new Error('blocks array must not be empty')
  }
  const header = 'INSERT INTO "blocks" ("index", "hash", "timeMined", "bloom", "coinbase", "difficulty", "extraData", "gasLimit", "parentHash", "receiptTrie", "stateRoot", "transactionsTrie", "rlp", "created",  "modified") VALUES\n'
  let inserts: string[] = []
  for (let block of blocks) {
    inserts.push(`(${block.index}, '${block.hash}', '${block.timeMined.toISOString()}', '${block.bloom}', '${block.coinbase}', '${block.difficulty}', '${block.extraData}', '${block.gasLimit}', '${block.parentHash}', '${block.receiptTrie}', '${block.stateRoot}', '${block.transactionsTrie}', '${block.rlp}', NOW(), NOW())`)
  }

  const sql = header + inserts.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

export interface CurrencyResult {
  currency: any,
  tokenContract: blockchain.TokenContract
}

export async function saveCurrencies(ground: Modeler, tokenContracts: blockchain.TokenContract[]): Promise<CurrencyResult[]> {
  const result: CurrencyResult[] = []
  for (let contract of tokenContracts) {
    if (!contract.name) {
      throw new Error('Contract is missing name property')
    }
    const record = await ground.collections.Currency.create({
      name: contract.name
    })
    result.push({
      currency: record,
      tokenContract: contract
    })
  }
  
  return result
}

export async function getNextBlock(lastBlockDao: LastBlockDao) {
  const lastBlockIndex = await lastBlockDao.getLastBlock()
  return typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0
}

export function saveSingleTransactions(ground: any, transactions: blockchain.SingleTransaction[], addresses: AddressMap) {
  const header = 'INSERT INTO "transactions" ("status", "txid", "to", "from", "amount", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n'
  const transactionClauses = transactions.map(t => {
    const to = t.to ? addresses[t.to] : 'NULL'
    const from = t.from ? addresses[t.from] : 'NULL'
    return `(${t.status}, '${t.txid}', ${to}, ${from}, ${t.amount}, ${t.fee}, ${t.nonce}, 2, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`
  })

  if (transactionClauses.length == 0)
    return Promise.resolve()

  const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

export async function deleteFullBlocks(ground: any, indexes: number[]): Promise<void> {
  if(indexes.length === 0 ) { return }
  const header = 'DELETE FROM blocks WHERE index IN '
  const sql = header + '(' + indexes.join(', ') + ');'
  await ground.querySingle(sql)
}
