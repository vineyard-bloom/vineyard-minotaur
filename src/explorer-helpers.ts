import { Collection } from "vineyard-data/legacy"
import { blockchain } from "vineyard-blockchain"

export async function saveSingleCurrencyBlock (blockCollection: Collection<blockchain.Block>,
                                               block: blockchain.Block): Promise<void> {

  const existing = await blockCollection.first({index: block.index})
  if (existing)
    return

  await blockCollection.create(block)
}

export function getTransactionByTxid<Tx> (transactionCollection: Collection<Tx>,
                                          txid: string): Promise<Tx | undefined> {
  return transactionCollection.first({txid: txid}).exec()
}