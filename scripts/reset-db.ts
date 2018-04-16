import { createEthereumVillage } from "../lab/ethereum-explorer-service"
import { createBitcoinVillage } from "../lab/bitcoin-explorer-service"
import { Modeler } from "vineyard-data/legacy"
import { FullConfig } from "../lab/config-types"
import { DevModeler } from "vineyard-ground/source/modeler"

export async function initialize(coin: 'Bitcoin' | 'Ethereum', config: FullConfig): Promise<void> {
  let dbModel: SharedModel
  switch (coin) {
    case 'Bitcoin':
      const btcVillage = await createBitcoinVillage(config)
      dbModel = btcVillage.model as SharedModel
      break
    case 'Ethereum':
      const ethVillage = await createEthereumVillage(config)
      dbModel = ethVillage.model as SharedModel
      break
    default:
      throw new Error('Invalid coin type, expected Bitcoin or Ethereum, got ' + coin)
  }

  (dbModel.ground as any).regenerate()

  await dbModel.LastBlock.create({ currency: 1 })
  await dbModel.LastBlock.create({ currency: 2 })
  await dbModel.Currency.create({ name: 'Bitcoin' })
  await dbModel.Currency.create({ name: 'Ethereum' })

  process.exit(0)
}
export type SharedModel = {ground: Modeler, LastBlock: any, Currency: any}

const coin = (process.argv[2] || 'Bitcoin') as 'Bitcoin' | 'Ethereum'
const config = require(process.argv[3] || '../config/config').localConfig as FullConfig

console.log(JSON.stringify(config))
initialize(coin, config)


