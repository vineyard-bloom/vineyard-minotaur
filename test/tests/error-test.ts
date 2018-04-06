require('source-map-support').install()
import BigNumber from "bignumber.js";
import { EthereumModel } from "../../src";
import { startEthereumMonitor, createVillage, MinotaurVillage } from "../../lab";
import { assert } from 'chai'
import { blockchain } from "vineyard-blockchain"

describe('error-test', function () {
  // this.timeout(10 * minute)
  // let village: Village
  let model: EthereumModel

  // beforeEach(async function () {
  //   village = await createVillage()
  //   model = village.model
  //   await (model.ground as any).regenerate()
  //   await model.Currency.create({ name: 'Bitcoin' })
  //   await model.Currency.create({ name: 'Ethereum' })
  // })

  it('from start', async function () {

  })
})