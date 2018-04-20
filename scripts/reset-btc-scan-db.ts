import { Modeler } from "vineyard-data/legacy"
import { DevModeler } from "vineyard-ground/source/modeler"
import { FullConfig } from "../lab/config-types"
import { createBitcoinVillage } from "../lab/bitcoin-explorer-service"
import { localConfig } from "../config/config-btc"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"

export async function resetBtcScanDb(config: FullConfig): Promise<void> {
  if(!config.database.devMode) throw new Error('Can only reset db in devMode.')

  const bitcoinConfig = config.bitcoin
  const dbModel = (await createBitcoinVillage(localConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig))).model as SharedModel

  await (dbModel.ground as DevModeler).regenerate()

  await dbModel.Currency.create({ name: 'Bitcoin' })
  await dbModel.Currency.create({ name: 'Ethereum' })

  await dbModel.LastBlock.create({ currency: 1 })
  await dbModel.LastBlock.create({ currency: 2 })
}
export type SharedModel = {ground: Modeler, LastBlock: any, Currency: any}

resetBtcScanDb(localConfig).then(() => process.exit(0))