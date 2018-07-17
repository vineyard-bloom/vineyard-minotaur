import { deleteFullBlocks, getNextBlock } from "./database-functions";
import { Profiler } from "./utility";
import { BlockQueue, BlockQueueConfig, BlockSource } from "./block-queue";
import { LastBlockDao } from "./types";
import { MonitorConfig } from "./ethereum-explorer";
import { blockchain } from "vineyard-blockchain"
import { Modeler } from "vineyard-data/legacy";
import { StatsD } from "hot-shots" 
const dogstatsd = new StatsD();

export enum ScannedBlockStatus {
  _new,
  same,
  replaced,
}

export type BlockSaver<Block, Transaction> = (bundles: blockchain.BlockBundle<Block, Transaction>[]) => Promise<void>

export interface IndexedHashedBlock {
  hash: string
  index: number
}

export async function createBlockQueue<Block, Transaction>(lastBlockDao: LastBlockDao,
                                                           client: blockchain.BlockReader<Block, Transaction>,
                                                           queueConfig: Partial<BlockQueueConfig>,
                                                           minConfirmations: number,
                                                           startingBlockIndex: number): Promise<BlockQueue<blockchain.BlockBundle<Block, Transaction>>> {
  const blockIndex = await getNextBlock(lastBlockDao)
  const highestBlock = await client.getHeighestBlockIndex()
  dogstatsd.increment('rpc.getblockcount')
  const blockSource: BlockSource<blockchain.BlockBundle<Block, Transaction>> = (index: number) => client.getBlockBundle(index)
  return new BlockQueue(blockSource, Math.max(blockIndex - minConfirmations, startingBlockIndex), highestBlock, queueConfig)
}

export function compareBlockHashes<T extends IndexedHashedBlock>(ground: Modeler, blocks: T[]): PromiseLike<(IndexedHashedBlock & { status: ScannedBlockStatus })[]> {
  const values: any = blocks.map(block => `(${block.index}, '${block.hash}')`)

  const sql = `
SELECT 
  temp."hash",
  temp."index",
  CASE 
    WHEN blocks.hash IS NULL THEN 0
    WHEN temp.hash = blocks.hash THEN 1
    ELSE 2
  END
  AS status   
FROM (VALUES ${values}) AS temp ("index", "hash")
LEFT JOIN blocks
ON temp."index" = blocks."index" 
  `

  return ground.query(sql)
}

export function mapBlocks<Block extends IndexedHashedBlock, Transaction>(fullBlocks: blockchain.BlockBundle<Block, Transaction>[]): (s: IndexedHashedBlock) => blockchain.BlockBundle<Block, Transaction> {
  return (simple: IndexedHashedBlock) => fullBlocks.filter(b => b.block.index == simple.index)[0]
}

export async function scanBlocks<Block extends IndexedHashedBlock, Transaction>(blockQueue: BlockQueue<blockchain.BlockBundle<Block, Transaction>>,
                                                     saveFullBlocks: BlockSaver<Block, Transaction>,
                                                     ground: Modeler,
                                                     lastBlockDao: LastBlockDao,
                                                     config: MonitorConfig,
                                                     profiler: Profiler): Promise<any> {
  const startTime: number = Date.now()

  while (true) {
    const elapsed = Date.now() - startTime
    if (config.maxMilliseconds && elapsed > config.maxMilliseconds) {
      console.log('Reached timeout of ', elapsed, 'milliseconds')
      console.log('Canceled blocks', blockQueue.requests.map((b: any) => b.blockIndex).join(', '))
      break
    }

    profiler.start('getBlocks')
    const bundles = await blockQueue.getBlocks()
    profiler.stop('getBlocks')
    if (bundles.length == 0) {
      console.log('No more blocks found.')
      break
    }

    console.log('Saving blocks', bundles.map((b: any) => b.index).join(', '))

    const blocks = bundles.map(b => b.block)
    const blockComparisons = await compareBlockHashes(ground, blocks)
    const blockMapper = mapBlocks(bundles)
    const newBlocks = blockComparisons.filter(b => b.status == ScannedBlockStatus._new)
      .map(blockMapper)

    const replacedBlocks = blockComparisons.filter(b => b.status == ScannedBlockStatus.replaced)
      .map(blockMapper)

    const blocksToDelete = replacedBlocks.map(bundle => bundle.block.index)
    console.log('Deleting blocks', blocksToDelete)

    profiler.start('deleteBlocks')
    await deleteFullBlocks(ground, blocksToDelete)
    profiler.stop('deleteBlocks')

    const blocksToSave = newBlocks.concat(replacedBlocks)

    if (blocksToSave.length > 0) {
      console.log('Saving blocks', blocksToSave)
      profiler.start('saveBlocks')
      await saveFullBlocks(blocksToSave)
      profiler.stop('saveBlocks')
    }

    const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index
    await lastBlockDao.setLastBlock(lastBlockIndex)
    console.log('Saved blocks; count', bundles.length, 'last', lastBlockIndex)

    profiler.logFlat()
  }
}

// export async function checkBlockScanStatus(dao: BitcoinMonitorDao, block: { index: number, hash: string }): Promise<ScannedBlockStatus> {
//   const { index, hash } = block
//   const retrievedBlock = await dao.blockDao.getBlockByIndex(index)
//   if (!retrievedBlock) return ScannedBlockStatus._new
//   if (retrievedBlock.hash !== hash) return ScannedBlockStatus.replaced
//   return ScannedBlockStatus.same
// }
