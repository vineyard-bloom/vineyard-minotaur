import { blockchain } from 'vineyard-blockchain'
import { Modeler } from 'vineyard-data/legacy'
import { LastBlockDao } from "./types";

export type AddressMap = { [key: string]: number }

export async function getOrCreateAddresses(ground: Modeler, addresses: AddressMap) {
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

export async function saveBlocks(ground: Modeler, blocks: blockchain.Block[]) {
  const header = 'INSERT INTO "blocks" ("index", "hash", "timeMined", "created", "modified") VALUES\n'
  let inserts: string[] = []
  for (let block of blocks) {
    inserts.push(`(${block.index}, '${block.hash}', '${block.timeMined.toISOString()}', NOW(), NOW())`)
  }

  const sql = header + inserts.join(',\n') + ' ON CONFLICT DO NOTHING;'
  return ground.querySingle(sql)
}

export interface CurrencyResult { currency: any, tokenContract: blockchain.TokenContract }

export async function saveCurrencies(ground: Modeler, tokenContracts: blockchain.Contract[]): Promise<CurrencyResult[]> {
  const result = []
  for (let contract of tokenContracts) {
    const token = contract as blockchain.TokenContract
    const record = await ground.collections.Currency.create({
      name: token.name
    })
    result.push({
      currency: record,
      tokenContract: token
    })
  }
  return result
}

export async function getNextBlock(lastBlockDao: LastBlockDao) {
  const lastBlockIndex = await lastBlockDao.getLastBlock()
  return typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0
}
