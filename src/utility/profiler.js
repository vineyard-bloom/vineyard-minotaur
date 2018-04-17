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
class SimpleProfiler {
    constructor() {
        this.profiles = {};
        this.previous = '';
    }
    start(name) {
        const profile = this.profiles[name] = (this.profiles[name] || { samples: [] });
        profile.timer = process.hrtime();
        this.previous = name;
    }
    stop(name = this.previous) {
        const profile = this.profiles[name];
        profile.samples.push(process.hrtime(profile.timer));
        profile.timer = undefined;
    }
    next(name) {
        this.stop(this.previous);
        this.start(name);
    }
    formatAverage(samples, index) {
        const average = Math.round(getAverage(samples.map(t => t[index]))).toString();
        return average.padStart(16, ' ');
    }
    log(profiles = this.profiles) {
        console.log('Profile results:');
        for (let i in profiles) {
            const profile = profiles[i];
            const average1 = this.formatAverage(profile.samples, 0);
            const average2 = this.formatAverage(profile.samples, 1);
            console.log(' ', i.toString().padStart(30, ' '), average1, average2);
        }
    }
    logFlat() {
        const profiles = {};
        for (let i in this.profiles) {
            let value = this.profiles[i];
            let name = i.replace(/\d+-/g, '');
            const profile = profiles[name] = (profiles[name] || { samples: [] });
            profile.samples = profile.samples.concat(value.samples);
        }
        this.log(profiles);
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