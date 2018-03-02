import BigNumber from "bignumber.js";
import { EthereumModel } from "../../src";
import { createVillage, Village } from "../src/village";
import { startEthereumMonitor } from "../src/ethereum-explorer-service"
import { assert } from 'chai'
import { blockchain } from "vineyard-blockchain"

require('source-map-support').install()

const minute = 60 * 1000

async function createTokenContract(village: Village, token: blockchain.TokenContract) {
  const contract = await village.model.Contract.create({
    address: token.address
  })

  const currency = await village.model.Currency.create({
    name: token.name
  })

  await village.model.Token.create({
    id: contract.id,
    name: token.name,
    totalSupply: token.totalSupply,
    decimals: token.decimals,
    version: token.version,
    symbol: token.symbol,
    address: token.address
  })
}

async function createSaltContract(village: Village) {
  await createTokenContract(village, {
    contractType: blockchain.ContractType.token,
    name: 'Salt',
    totalSupply: new BigNumber('12000000000000000'),
    decimals: 8,
    version: '1.0',
    symbol: 'SALT',
    address: ''
  })
}

describe('eth-scan', function () {
  this.timeout(10 * minute)
  let village: Village
  let model: EthereumModel

  beforeEach(async function () {
    village = await createVillage()
    model = village.model
    await (model.ground as any).regenerate()
    await model.Currency.create({ name: 'Bitcoin' })
    await model.Currency.create({ name: 'Ethereum' })
  })

  it('from start', async function () {
    await model.LastBlock.create({ currency: 2 })
    console.log('Initialized village')
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 1 * minute
    })
    assert(true)
  })

  it('from 4 mil', async function () {
    await model.LastBlock.create({ currency: 2, blockIndex: 4000000 })
    console.log('Initialized village')
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 1 * minute
    })
    assert(true)
  })

  it('can rescan', async function () {
    await model.LastBlock.create({ currency: 2, blockIndex: 4000000 })
    console.log('Initialized village')
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 0.1 * minute
    })

    await model.LastBlock.update({ currency: 2, blockIndex: 4000000 })
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 10,
      maxMilliseconds: 0.2 * minute
    })
    assert(true)
  })

  it('scans tokens', async function () {
    await model.LastBlock.create({ currency: 2, blockIndex: 4086319 })
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 1,
      maxMilliseconds: 1 * minute
    })

    const tokens = await model.Token.all()
    assert.isAtLeast(tokens.length, 1)
  })

  it('detects successful token transfers', async function () {
    await createSaltContract(village)

    await model.LastBlock.create({ currency: 2, blockIndex: 5126521 })
    await startEthereumMonitor(village, {
      maxConsecutiveBlocks: 1,
      maxMilliseconds: 0.1 * minute
    })

    const transfers = await model.TokenTransfer.all()
    assert.isAtLeast(transfers.length, 1)
  })

})