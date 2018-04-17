import { createEthereumVillage } from "../lab/ethereum-explorer-service"
import { Modeler } from "vineyard-data/legacy"
import { DevModeler } from "vineyard-ground/source/modeler"
import { FullConfig } from "../lab/config-types"
import { localConfig } from "../config/config"

export async function resetEthScanDb(config: FullConfig): Promise<void> {
  if(!config.database.devMode) throw new Error('Can only reset db in devMode.')
  const dbModel = (await createEthereumVillage(config)).model as SharedModel

  (dbModel.ground as DevModeler).regenerate()

  await dbModel.LastBlock.create({ currency: 1 })
  await dbModel.LastBlock.create({ currency: 2 })
  await dbModel.Currency.create({ name: 'Bitcoin' })
  await dbModel.Currency.create({ name: 'Ethereum' })

  process.exit(0)
}
export type SharedModel = {ground: Modeler, LastBlock: any, Currency: any}

resetEthScanDb(localConfig)