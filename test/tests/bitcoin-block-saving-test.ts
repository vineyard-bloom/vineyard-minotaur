import { assert } from 'chai'
import { checkIfBlockSaved } from "../../src";
import { createBitcoinExplorerDao } from '../../src/bitcoin-explorer/bitcoin-model';

describe('bitcoin block saving test', function () {
  
    it('can get a block by index', async function () {
       createBitcoinExplorerDao()
       const blockExists = await checkIfBlockSaved(dao, block)
       assert(blockExists)
    })

  })
