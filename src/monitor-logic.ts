import { getNextBlock } from "./database-functions";
import { EmptyProfiler, Profiler } from "./utility";
import { BlockQueueConfig, ExternalBlockQueue, IndexedBlock } from "./block-queue";
import { LastBlockDao } from "./types";
import { MonitorConfig } from "./ethereum-explorer";
import { blockchain } from "vineyard-blockchain"
import { Modeler } from "vineyard-ground";

export type BlockSaver<Block extends IndexedBlock> = (blocks: Block[]) => Promise<void>

export async function createBlockQueue<Block extends IndexedBlock>(lastBlockDao: LastBlockDao,
                                                                   client: blockchain.BlockReader<Block>,
                                                                   queueConfig: BlockQueueConfig) {
  let blockIndex = await getNextBlock(lastBlockDao)
  return new ExternalBlockQueue(client, blockIndex, queueConfig)
}

export interface BlockSource {
  getHighestBlockIndex(): Promise<number>

  getBlock(index: number): Promise<blockchain.Block>
}

export async function findInvalidBlock(localSource: BlockSource, remoteSource: BlockSource): Promise<number | undefined> {
  let highestBlockIndex = await localSource.getHighestBlockIndex()
  let localBlock = await localSource.getBlock(highestBlockIndex)
  let foundInvalidBlocks = false

  while (true) {
    const remoteBlock = await remoteSource.getBlock(localBlock.index)
    if (localBlock.hash == remoteBlock.hash) {
      return foundInvalidBlocks
        ? localBlock.index + 1
        : undefined
    }

    foundInvalidBlocks = true
    localBlock = await localSource.getBlock(localBlock.index - 1)
  }
}

// Use Modeler for ground?
export async function validateBlocks(localBlockSource: BlockSource, remoteBlockSource: BlockSource, ground: Modeler) {
  const rootInvalidBlock = findInvalidBlock(localBlockSource, remoteBlockSource)
  if (rootInvalidBlock === undefined)
    return

  // TODO: SQL to delete all blocks at and above rootInvalidBlock

  const sql = `
  BEGIN;
  
  DELETE * FROM blocks WHERE "index" >= :rootInvalidBlock;
  
  UPDATE last_blocks SET "blockIndex" = :rootInvalidBlock - 1 WHERE currency = :currency;
  
  COMMIT;
  `

  return ground.query(sql, { rootInvalidBlock, currency })
}

export async function scanBlocks<Block extends IndexedBlock>(blockQueue: ExternalBlockQueue<Block>,
                                                             saveFullBlocks: BlockSaver<Block>,
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

    profiler.start('saveBlocks')
    await saveFullBlocks(blocks)
    profiler.stop('saveBlocks')
  }
  while (true)

}