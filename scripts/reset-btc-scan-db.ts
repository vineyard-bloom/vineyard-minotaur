import { Modeler } from "vineyard-data/legacy"
import { DevModeler } from "vineyard-ground/source/modeler"
import { BitcoinVillage, createBitcoinVillage } from "../lab/bitcoin-explorer-service"
import { bitcoinConfig } from "../config/config-btc"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"

export async function resetBtcScanDb(village: BitcoinVillage): Promise<void> {
  if(!village.config.database.devMode) throw new Error('Can only reset db in devMode.')

  const dbModel = village.model

  await (dbModel.ground as DevModeler).regenerate()

  await dbModel.Currency.create({ name: 'Bitcoin' })
  await dbModel.Currency.create({ name: 'Ethereum' })

  await dbModel.LastBlock.create({ currency: 1 })
  await dbModel.LastBlock.create({ currency: 2 })
}
export type SharedModel = {ground: Modeler, LastBlock: any, Currency: any}

if (require.main === module) {
  createBitcoinVillage(bitcoinConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig.bitcoin))
    .then(resetBtcScanDb)
    .then(() => process.exit(0))
}