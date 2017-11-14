export interface Trellis {
  primary_keys?: string[]
  properties: any
}

export interface FullSchema {
  Transaction: Trellis
}

export function getFullMinotaurSchema(): FullSchema {
  return require('./schema.json')
}