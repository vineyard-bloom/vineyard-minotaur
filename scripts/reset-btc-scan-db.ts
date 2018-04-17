import { Modeler } from "vineyard-data/legacy"
import { DevModeler } from "vineyard-ground/source/modeler"
import { FullConfig } from "../lab/config-types"
import { createBitcoinVillage } from "../lab/bitcoin-explorer-service"
import { localConfig } from "../config/config-btc"

export async function resetBtcScanDb(config: FullConfig): Promise<void> {
  if(!config.database.devMode) throw new Error('Can only reset db in devMode.')
  const dbModel = (await createBitcoinVillage(config)).model as SharedModel

  await (dbModel.ground as DevModeler).regenerate()

  await dbModel.Currency.create({ name: 'Bitcoin' })
  await dbModel.Currency.create({ name: 'Ethereum' })

  await dbModel.LastBlock.create({ currency: 1 })
  await dbModel.LastBlock.create({ currency: 2 })

  process.exit(0)
}
export type SharedModel = {ground: Modeler, LastBlock: any, Currency: any}

resetBtcScanDb(localConfig)