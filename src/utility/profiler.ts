export interface CumulativeAverage {
  sum: number
  count: number
}

export interface Profile {
  seconds: CumulativeAverage
  nanoseconds: CumulativeAverage
  timer: any
}

export function getAverage(values: number[]) {
  let sum = 0
  for (let value of values) {
    sum += value / values.length
  }
  return sum
}

export type ProfilerMap = { [key: string]: Profile }

export interface Profiler {
  start(name: string): void

  stop(name?: string): void

  next(name: string): void

  log(profiles?: ProfilerMap): void

  logFlat(): void
}

function newCumulativeAverage() {
  return {
    sum: 0,
    count: 0
  }
}

function newProfile() {
  return {
    nanoseconds: newCumulativeAverage(),
    seconds: newCumulativeAverage(),
    timer: undefined
  }
}

function updateCumulativeAverage(average: CumulativeAverage, sample: number) {
  average.sum += sample
  average.count++
}

export class SimpleProfiler implements Profiler {
  private profiles: ProfilerMap = {}
  private previous: string = ''

  start(name: string) {
    const profile = this.profiles[name] = (this.profiles[name] || newProfile())
    profile.timer = process.hrtime()
    this.previous = name
  }

  stop(name: string = this.previous) {
    const profile = this.profiles[name]
    const sample = process.hrtime(profile.timer)
    updateCumulativeAverage(profile.seconds, sample[0])
    updateCumulativeAverage(profile.nanoseconds, sample[1])
    profile.timer = undefined
  }

  next(name: string) {
    this.stop(this.previous)
    this.start(name)
  }

  private formatAverage(cumulativeAverage: CumulativeAverage) {
    const average = Math.round(cumulativeAverage.sum/cumulativeAverage.count).toString()
    return (average as any).padStart(16, ' ')
  }

  log(profiles: ProfilerMap = this.profiles) {
    console.log('Profile results:')
    for (let i in profiles) {
      const profile = profiles[i]
      const average1 = this.formatAverage(profile.seconds)
      const average2 = this.formatAverage(profile.nanoseconds)
      console.log(' ', (i.toString() as any).padStart(30, ' '), average1, average2)
    }
  }

  logFlat() {
    // const profiles: { [key: string]: Profile } = {}
    // for (let i in this.profiles) {
    //   let value = this.profiles[i]
    //   let name = i.replace(/\d+-/g, '')
    //   const profile = profiles[name] = (profiles[name] || { samples: [] })
    //   profile.samples = profile.samples.concat(value.samples)
    // }
    this.log(this.profiles)
  }
}

export class EmptyProfiler implements Profiler {

  start(name: string) {
  }

  stop(name?: string) {
  }

  next(name: string) {
  }

  log(profiles?: ProfilerMap) {
  }

  logFlat() {
  }
}
