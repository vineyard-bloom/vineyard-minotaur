import { BigNumber } from "bignumber.js"

export interface UTXO {
  txid: string,
  amount: BigNumber
  index: number
}

export async function getUtxos(ground: any, btcAddress: string): Promise<UTXO[]> {
  const addressId = (await ground.querySingle(`Select id FROM addresses WHERE address='${btcAddress}'`)).id

  const rawReturns = ground.query(
    ` SELECT transactions.txid, txouts.amount, txouts.index
      FROM txouts 
      LEFT JOIN txins ON txins."sourceTransaction" = txouts.transaction AND txins."sourceIndex" = txouts.index
      JOIN transactions ON transactions.id = txouts.transaction  
      WHERE NOT ("sourceTransaction" IS NOT NULL) AND txouts.address=${addressId}
      `
  ) as { txid: string, amount: string, index: number } []
  return rawReturns.map(result => {
    const {txid, amount, index} = result
    return {
      txid: txid.trim(),
      amount: new BigNumber(amount),
      index
    }
  })
}
