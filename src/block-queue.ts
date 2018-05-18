import { blockchain } from "vineyard-blockchain"

export interface BlockRequest {
  blockIndex: number
  promise: any
}

export interface BlockQueueConfig {
  maxSize: number
  maxBlockRequests: number
  minSize: number
}

const blockQueueConfigDefaults = {
  maxSize: 10,
  maxBlockRequests: 5,
  minSize: 1
}

export interface IndexedBlock {
  index: number
}

export class ExternalBlockQueue<Block extends IndexedBlock> {
  private blocks: Block[] = []
  private blockIndex: number
  private highestBlockIndex: number | undefined
  private client: blockchain.BlockReader<Block>
  private config: BlockQueueConfig
  requests: BlockRequest[] = []
  private listeners: {
    resolve: (block: Block[]) => void
    reject: (error: Error) => void
  }[] = []

  constructor(client: blockchain.BlockReader<Block>, blockIndex: number,
              config: BlockQueueConfig) {
    this.client = client
    this.blockIndex = blockIndex
    this.config = Object.assign({}, blockQueueConfigDefaults, config)
  }

  getBlockIndex(): number {
    return this.blockIndex
  }

  private removeRequest(blockIndex: number) {
    this.requests = this.requests.filter(r => r.blockIndex != blockIndex)
  }

  private removeBlocks(blocks: Block[]) {
    this.blocks = this.blocks.filter(b => blocks.every(b2 => b2.index != b.index))
  }

  private onResponse(blockIndex: number, block: Block | undefined) {
    this.removeRequest(blockIndex)

    if (!block) {
      if (this.listeners.length > 0) {
        const listeners = this.listeners
        this.listeners = []
        for (let listener of listeners) {
          listener.reject(new Error("Error loading block"))
        }
      }
    }
    else {
      this.blocks.push(block)
      const listeners = this.listeners
      if (this.listeners.length > 0) {
        const readyBlocks = this.getConsecutiveBlocks()
        if (readyBlocks.length > 0) {
          this.listeners = []
          this.removeBlocks(readyBlocks)
          for (let listener of listeners) {
            listener.resolve(readyBlocks)
          }
        }
      }
      // else {
      //   console.log('no listeners')
      // }
    }
  }

  private addRequest(index: number) {
    // console.log('add block', index)
    const tryRequest: () => any = () =>
      this.client.getFullBlock(index)
        .then(block => this.onResponse(index, block))
        .catch((error) => {
          console.error('Error reading block', index, error)
          return tryRequest()
        })

    const promise = tryRequest()
    this.requests.push({
      blockIndex: index,
      promise: promise
    })
  }

  private async update(): Promise<void> {
    if (this.highestBlockIndex === undefined) {
      this.highestBlockIndex = await this.client.getHeighestBlockIndex()
    }

    const remaining = this.highestBlockIndex - this.blockIndex
    let count = Math.min(
      remaining,
      this.config.maxBlockRequests - this.requests.length,
      this.config.maxSize - this.requests.length - this.blocks.length
    )
    if (count < 0) count = 0
    console.log('Adding blocks', Array.from(new Array(count), (x, i) => i + this.blockIndex).join(', '))
    for (let i = 0; i < count; ++i) {
      this.addRequest(this.blockIndex++)
    }
  }

  // Ensures that batches of blocks are returned in consecutive order
  private getConsecutiveBlocks(): Block[] {
    if (this.blocks.length == 0)
      return []

    const results = this.blocks.concat([]).sort((a, b) => a.index > b.index ? 1 : -1)
    const oldestRequest = this.requests.map(r => r.blockIndex).sort()[0]
    const oldestResult = results[0].index
    if (oldestRequest && oldestResult > oldestRequest) {
      return []
    }

    const blocks: Block[] = []
    let i = oldestResult
    for (let r of results) {
      if (r.index != i++)
        break

      blocks.push(r)
    }

    if (blocks.length < this.config.minSize && this.requests.length > 0) {
      return []
    }
    return blocks
  }

  async getBlocks(): Promise<Block[]> {
    await this.update()

    const readyBlocks = this.getConsecutiveBlocks()
    if (readyBlocks.length > 0) {
      this.removeBlocks(readyBlocks)
      return Promise.resolve(readyBlocks)
    }
    else if (this.requests.length == 0) {
      return Promise.resolve([])
    }
    else {
      return new Promise<Block[]>((resolve, reject) => {
        this.listeners.push({
          resolve: resolve,
          reject: reject
        })
      })
    }
  }
}
