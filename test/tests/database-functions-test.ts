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


})