import { BigNumber } from "bignumber.js"
import { Address, BaseBlock, Currency, ID, LastBlock, MonitorDao } from "../types";
import { blockchain } from "vineyard-blockchain"
import { Collection, Modeler } from "vineyard-data/legacy"
import { createIndexedLastBlockDao } from "../monitor-dao"
import { saveSingleCurrencyBlock } from "../explorer-helpers"

export interface BitcoinMonitorDao extends MonitorDao {
  ground: Modeler
}

export function createBitcoinExplorerDao(model: BitcoinModel): BitcoinMonitorDao {
  return {
    blockDao: {
      saveBlock: (block: BaseBlock) => saveSingleCurrencyBlock(model.Block, block)
    },
    lastBlockDao: createIndexedLastBlockDao(model.ground, 1),

    ground: model.ground
  }
}

export interface BitcoinModel {
  Address: Collection<Address>
  Block: Collection<blockchain.Block>
  Currency: Collection<Currency>
  LastBlock: Collection<LastBlock>

  Transaction: Collection<BitcoinTransaction>
  TxIn: Collection<TxIn>
  TxOut: Collection<TxOut>

  ground: Modeler
}

export interface BitcoinTransaction extends blockchain.BlockTransaction {
  currency: ID<Currency>
  id: number
}

export interface TxIn {
  //primaryKey: transaction + index
  transaction: ID<BitcoinTransaction>
  index: number
  sourceTransaction: ID<BitcoinTransaction> | undefined
  sourceIndex: number | undefined
  scriptSigHex: string | undefined
  scriptSigAsm: string | undefined
  sequence: number
  coinbase: string | undefined
}

export interface TxOut {
  //primaryKey: transaction + index
  transaction: ID<BitcoinTransaction>,
  index: number,
  scriptPubKeyHex: string,
  scriptPubKeyAsm: string,
  address: ID<Address>,
  amount: BigNumber
}
