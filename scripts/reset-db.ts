
import { localConfig } from "../config/config"
import { createEthereumVillage } from "../lab/ethereum-explorer-service"

export async function initialize(model?: any): Promise<void> {
  let dbModel: any

  if(!model){
    const village = await createEthereumVillage(localConfig)
    dbModel = village.model
  } else {
    dbModel = model
  }

  await (dbModel.ground as any).regenerate()
  await dbModel.Currency.create({ name: 'Bitcoin' })
  await dbModel.Currency.create({ name: 'Ethereum' })
  await dbModel.LastBlock.create({ currency: 2 })
  process.exit(0)
}

initialize()
