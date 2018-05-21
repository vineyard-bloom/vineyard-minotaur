import { assert, expect } from 'chai'
import { saveCurrencies, EthereumModel, EthereumMonitorDao, createEthereumExplorerDao } from '../../src'
import { ethereumConfig } from '../config/config'
import { Modeler } from 'vineyard-ground'
import { createEthereumVillage } from '../../lab'
import { EthereumBlockReader } from 'vineyard-ethereum/src'
import BigNumber from 'bignumber.js'

require('source-map-support').install()

describe('database functions test', function () {
  this.timeout(60000)

  let model: EthereumModel
  let dao: EthereumMonitorDao

  before(async function() {
    const village = await createEthereumVillage(ethereumConfig)
    model = village.model
  })

  it('throws an error when trying to save an incorrect currency', async function () {

    const contract = [{
      address: 'abcdefg',
      contractType: 1,
      txid: 'hijklmn',
      name: 'opqrst',
      totalSupply: 6,
      decimals: new BigNumber(6),
      version: 'uvwxyz',
      symbol: 'zyxwvu'
    }]

    // Example error test:
    // expect(manager.test.bind(manager)).to.throw('Oh no')
    expect(saveCurrencies.bind(saveCurrencies, model.ground, contract)).to.throw('Oh no')
  })

})