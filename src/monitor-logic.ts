import { getNextBlock, deleteFullBlocks } from "./database-functions";
import { EmptyProfiler, Profiler } from "./utility";
import { BlockQueueConfig, ExternalBlockQueue, IndexedBlock } from "./block-queue";
import { LastBlockDao } from "./types";
import { MonitorConfig } from "./ethereum-explorer";
import { blockchain } from "vineyard-blockchain"
import { Modeler } from "vineyard-data/legacy";

export enum ScannedBlockStatus {
  _new,
  same,
  replaced,
}

export type BlockSaver<Block extends IndexedBlock> = (blocks: Block[]) => Promise<void>

export interface IndexedHashedBlock extends IndexedBlock {
  hash: string
}

export async function createBlockQueue<Block extends IndexedBlock>(lastBlockDao: LastBlockDao,
                                                                   client: blockchain.BlockReader<Block>,
                                                                   queueConfig: BlockQueueConfig,
                                                                   minConfirmations: number,
                                                                   startingBlockIndex: number) {
  let blockIndex = await getNextBlock(lastBlockDao)
  return new ExternalBlockQueue(client, Math.max(blockIndex - minConfirmations, startingBlockIndex), queueConfig)
}

export interface BlockSource {
  getHighestBlockIndex(): Promise<number>

  getBlock(index: number): Promise<blockchain.Block>
}

// export async function findInvalidBlock(localSource: BlockSource, remoteSource: BlockSource): number | undefined {
//   let highestBlockIndex = await localSource.getHighestBlockIndex()
//   let localBlock = await localSource.getBlock(highestBlockIndex)
//   let foundInvalidBlocks = false
//
//   while (true) {
//     const remoteBlock = await remoteSource.getBlock(localBlock.index)
//     if (localBlock.hash == remoteBlock.hash) {
//       return foundInvalidBlocks
//         ? localBlock.index + 1
//         : undefined
//     }
//
//     foundInvalidBlocks = true
//     localBlock = await localSource.getBlock(localBlock.index - 1)
//   }
// }

export function compareBlockHashes<T extends IndexedHashedBlock>(ground: Modeler, blocks: T[]): PromiseLike<(IndexedHashedBlock & {status: ScannedBlockStatus})[]> {
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


export function mapBlocks<T extends IndexedHashedBlock>(fullBlocks: T[]): (s: IndexedBlock) => T {
  return (simple: IndexedBlock) => fullBlocks.filter(b => b.index == simple.index)[0]
}

export async function scanBlocks<Block extends IndexedHashedBlock>(blockQueue: ExternalBlockQueue<Block>,
                                                                   saveFullBlocks: BlockSaver<Block>,
                                                                   ground: Modeler,
                                                                   lastBlockDao: LastBlockDao,
                                                                   config: MonitorConfig,
                                                                   profiler: Profiler = new EmptyProfiler()): Promise<any> {
  const startTime: number = Date.now()

  do {
    const elapsed = Date.now() - startTime
    if (config.maxMilliseconds && elapsed > config.maxMilliseconds) {
      console.log('Reached timeout of ', elapsed, 'milliseconds')
      console.log('Canceled blocks', blockQueue.requests.map((b: any) => b.blockIndex).join(', '))
      break
    }

    profiler.start('getBlocks')
    const blocks = await blockQueue.getBlocks()
    profiler.stop('getBlocks')
    if (blocks.length == 0) {
      console.log('No more blocks found.')
      break
    }

    console.log('Saving blocks', blocks.map((b: any) => b.index).join(', '))

    const blockComparisons = await compareBlockHashes(ground, blocks)
    const blockMapper = mapBlocks(blocks)
    const newBlocks = blockComparisons.filter(b => b.status == ScannedBlockStatus._new)
      .map(blockMapper)

    const replacedBlocks = blockComparisons.filter(b => b.status == ScannedBlockStatus.replaced)
      .map(blockMapper)

    const blocksToDelete = replacedBlocks.map(block => block.index)
    console.log('Deleting blocks', blocksToDelete)

    profiler.start('deleteBlocks')
    await deleteFullBlocks(ground, blocksToDelete)
    profiler.stop('deleteBlocks')

    const blocksToSave = newBlocks.concat(replacedBlocks)
    console.log('Saving blocks', blocksToSave)

    profiler.start('saveBlocks')
    await saveFullBlocks(blocksToSave)
    profiler.stop('saveBlocks')

    const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index
    await lastBlockDao.setLastBlock(lastBlockIndex)
    console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex)

  }
  while (true)

}

// export async function checkBlockScanStatus(dao: BitcoinMonitorDao, block: { index: number, hash: string }): Promise<ScannedBlockStatus> {
//   const { index, hash } = block
//   const retrievedBlock = await dao.blockDao.getBlockByIndex(index)
//   if (!retrievedBlock) return ScannedBlockStatus._new
//   if (retrievedBlock.hash !== hash) return ScannedBlockStatus.replaced
//   return ScannedBlockStatus.same
// }
