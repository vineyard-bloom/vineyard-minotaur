import { assert, expect } from 'chai'
import { saveCurrencies } from '../../src'
import { ethereumConfig } from '../config/config'
import { Modeler } from 'vineyard-ground';

require('source-map-support').install()

describe('database functions test', function () {
  this.timeout(60000)

  before(async function() {
  })

  beforeEach(async function () {
  })

  it('throws an error when trying to save an incorrect currency', async function () {
    // let ground: Modeler
    // const contracts = []
    // expect(manager.test.bind(manager)).to.throw('Oh no')
    // expect(saveCurrencies(ground, contracts)).to.throw('Oh no')
  })

})