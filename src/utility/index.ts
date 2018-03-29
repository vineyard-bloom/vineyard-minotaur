export * from './profiler'

export function flatMap<A, B>(array: A[], mapper: (a: A) => B[],) {
  return array.reduce((accumulator: B[], a) =>
    accumulator.concat(mapper(a)), [])
}
