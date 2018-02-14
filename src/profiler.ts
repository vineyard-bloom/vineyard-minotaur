export interface Profile {
  samples: number[][]
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

export class SimpleProfiler implements Profiler {
  private profiles: ProfilerMap = {}
  private previous: string = ''

  start(name: string) {
    const profile = this.profiles[name] = (this.profiles[name] || { samples: [] })
    profile.timer = process.hrtime()
    this.previous = name
  }

  stop(name: string = this.previous) {
    const profile = this.profiles[name]
    profile.samples.push(process.hrtime(profile.timer))
    profile.timer = undefined
  }

  next(name: string) {
    this.stop(this.previous)
    this.start(name)
  }

  private formatAverage(samples: number[][], index: number) {
    const average = Math.round(getAverage(samples.map(t => t[index]))).toString()
    return (average as any).padStart(16, ' ')
  }

  log(profiles: ProfilerMap = this.profiles) {
    console.log('Profile results:')
    for (let i in profiles) {
      const profile = profiles[i]
      const average1 = this.formatAverage(profile.samples, 0)
      const average2 = this.formatAverage(profile.samples, 1)
      console.log(' ', (i.toString() as any).padStart(30, ' '), average1, average2)
    }
  }

  logFlat() {
    const profiles: { [key: string]: Profile } = {}
    for (let i in this.profiles) {
      let value = this.profiles[i]
      let name = i.replace(/\d+-/g, '')
      const profile = profiles[name] = (profiles[name] || { samples: [] })
      profile.samples = profile.samples.concat(value.samples)
    }
    this.log(profiles)
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
