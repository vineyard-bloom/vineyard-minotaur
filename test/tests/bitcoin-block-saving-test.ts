import { assert } from 'chai'
import { checkIfBlockSaved } from "../../src";
import { createBitcoinExplorerDao } from '../../src/bitcoin-explorer/bitcoin-model';
import { createBitcoinVillage } from "../../lab/bitcoin-explorer-service"
import { bitcoinConfig } from "../../config/config-btc"
import { BitcoinBlockReader } from "vineyard-bitcoin/src/bitcoin-block-reader"

describe('bitcoin block saving test', function () {
  
    it('can get a block by index', async function () {
      const village = await createBitcoinVillage(bitcoinConfig, BitcoinBlockReader.createFromConfig(bitcoinConfig.bitcoin))
      const { model, client } = village
      const dao = createBitcoinExplorerDao(model)


      const blockExists = await checkIfBlockSaved(dao, block)
      assert(blockExists)
    })

  })
