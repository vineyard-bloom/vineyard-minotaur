"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAverage(values) {
    let sum = 0;
    for (let value of values) {
        sum += value / values.length;
    }
    return sum;
}
exports.getAverage = getAverage;
function newCumulativeAverage() {
    return {
        sum: 0,
        count: 0
    };
}
function newProfile() {
    return {
        nanoseconds: newCumulativeAverage(),
        seconds: newCumulativeAverage(),
        timer: undefined
    };
}
function updateCumulativeAverage(average, sample) {
    average.sum += sample;
    average.count++;
}
class SimpleProfiler {
    constructor() {
        this.profiles = {};
        this.previous = '';
    }
    start(name) {
        const profile = this.profiles[name] = (this.profiles[name] || newProfile());
        profile.timer = process.hrtime();
        this.previous = name;
    }
    stop(name = this.previous) {
        const profile = this.profiles[name];
        const sample = process.hrtime(profile.timer);
        updateCumulativeAverage(profile.seconds, sample[0]);
        updateCumulativeAverage(profile.nanoseconds, sample[1]);
        profile.timer = undefined;
    }
    next(name) {
        this.stop(this.previous);
        this.start(name);
    }
    formatAverage(cumulativeAverage) {
        const average = Math.round(cumulativeAverage.sum / cumulativeAverage.count).toString();
        return average.padStart(16, ' ');
    }
    log(profiles = this.profiles) {
        console.log('Profile results:');
        for (let i in profiles) {
            const profile = profiles[i];
            const average1 = this.formatAverage(profile.seconds);
            const average2 = this.formatAverage(profile.nanoseconds);
            console.log(' ', i.toString().padStart(30, ' '), average1, average2);
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
        this.log(this.profiles);
    }
}
exports.SimpleProfiler = SimpleProfiler;
class EmptyProfiler {
    start(name) {
    }
    stop(name) {
    }
    next(name) {
    }
    log(profiles) {
    }
    logFlat() {
    }
}
exports.EmptyProfiler = EmptyProfiler;
//# sourceMappingURL=profiler.js.map