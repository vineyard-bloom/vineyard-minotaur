import { blockchain } from "vineyard-blockchain"

export type FullBlock = blockchain.FullBlock<blockchain.ContractTransaction>

export type SingleTransactionBlockClient = blockchain.BlockReader<blockchain.ContractTransaction>

export interface BlockRequest {
  blockIndex: number
  promise: any
}

export class ExternalBlockQueue {
  private blocks: FullBlock[] = []
  private blockIndex: number
  private highestBlockIndex: number
  private client: SingleTransactionBlockClient
  private maxSize: number
  requests: BlockRequest[] = []
  private listeners: {
    resolve: (block: FullBlock[]) => void
    reject: (error: Error) => void
  }[] = []

  // p = new Profiler()

  constructor(client: SingleTransactionBlockClient, blockIndex: number,
              maxSize: number = 40) {
    this.client = client
    this.blockIndex = blockIndex
    this.maxSize = maxSize
  }

  getBlockIndex(): number {
    return this.blockIndex
  }

  private removeRequest(blockIndex: number) {
    this.requests = this.requests.filter(r => r.blockIndex != blockIndex)
  }

  private onResponse(blockIndex: number, block: FullBlock | undefined) {
    // this.p.stop(blockIndex + '-blockQueue')
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
      if (this.listeners.length > 0) {
        const listeners = this.listeners
        this.listeners = []
        for (let listener of listeners) {
          listener.resolve([block])
        }
      }
      else {
        this.blocks.push(block)
      }
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
          // this.onResponse(index, undefined)
        })

    const promise = tryRequest()
    this.requests.push({
      blockIndex: index,
      promise: promise
    })
  }

  private async update(): Promise<void> {
    if (this.highestBlockIndex === undefined) {
      this.highestBlockIndex = await this.client.getBlockIndex()
    }

    const remaining = this.highestBlockIndex - this.blockIndex
    const count = Math.min(remaining, this.maxSize) - this.requests.length
    console.log('Adding blocks', Array.from(new Array(count), (x, i) => i + this.blockIndex).join(', '))
    for (let i = 0; i < count; ++i) {
      this.addRequest(this.blockIndex++)
    }
  }

  async getBlocks(): Promise<FullBlock[]> {
    await this.update()

    if (this.blocks.length > 0) {
      const result = this.blocks
      this.blocks = []
      return Promise.resolve(result)
    }
    else if (this.requests.length == 0) {
      return Promise.resolve([])
    }
    else {
      return new Promise<FullBlock[]>((resolve, reject) => {
        this.listeners.push({
          resolve: resolve,
          reject: reject
        })
      })
    }
  }
}
