import { getNextBlock } from "./database-functions";
import { EmptyProfiler, Profiler } from "./utility";
import { BlockQueueConfig, ExternalBlockQueue, IndexedBlock } from "./block-queue";
import { LastBlockDao } from "./types";
import { MonitorConfig, SingleTransactionBlockClient } from "./ethereum-explorer";
import { blockchain } from "vineyard-blockchain"

export type BlockSaver<Block extends IndexedBlock> = (blocks: Block[]) => Promise<void>

export async function createBlockQueue<Block extends IndexedBlock>(lastBlockDao: LastBlockDao,
                                                                   client: blockchain.BlockReader<Block>,
                                                                   queueConfig: BlockQueueConfig) {
  let blockIndex = await getNextBlock(lastBlockDao)
  return new ExternalBlockQueue(client, blockIndex, queueConfig)
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