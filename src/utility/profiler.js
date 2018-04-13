"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAverage(values) {
    var sum = 0;
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var value = values_1[_i];
        sum += value / values.length;
    }
    return sum;
}
exports.getAverage = getAverage;
var SimpleProfiler = /** @class */ (function () {
    function SimpleProfiler() {
        this.profiles = {};
        this.previous = '';
    }
    SimpleProfiler.prototype.start = function (name) {
        var profile = this.profiles[name] = (this.profiles[name] || { samples: [] });
        profile.timer = process.hrtime();
        this.previous = name;
    };
    SimpleProfiler.prototype.stop = function (name) {
        if (name === void 0) { name = this.previous; }
        var profile = this.profiles[name];
        profile.samples.push(process.hrtime(profile.timer));
        profile.timer = undefined;
    };
    SimpleProfiler.prototype.next = function (name) {
        this.stop(this.previous);
        this.start(name);
    };
    SimpleProfiler.prototype.formatAverage = function (samples, index) {
        var average = Math.round(getAverage(samples.map(function (t) { return t[index]; }))).toString();
        return average.padStart(16, ' ');
    };
    SimpleProfiler.prototype.log = function (profiles) {
        if (profiles === void 0) { profiles = this.profiles; }
        console.log('Profile results:');
        for (var i in profiles) {
            var profile = profiles[i];
            var average1 = this.formatAverage(profile.samples, 0);
            var average2 = this.formatAverage(profile.samples, 1);
            console.log(' ', i.toString().padStart(30, ' '), average1, average2);
        }
    };
    SimpleProfiler.prototype.logFlat = function () {
        var profiles = {};
        for (var i in this.profiles) {
            var value = this.profiles[i];
            var name_1 = i.replace(/\d+-/g, '');
            var profile = profiles[name_1] = (profiles[name_1] || { samples: [] });
            profile.samples = profile.samples.concat(value.samples);
        }
        this.log(profiles);
    };
    return SimpleProfiler;
}());
exports.SimpleProfiler = SimpleProfiler;
var EmptyProfiler = /** @class */ (function () {
    function EmptyProfiler() {
    }
    EmptyProfiler.prototype.start = function (name) {
    };
    EmptyProfiler.prototype.stop = function (name) {
    };
    EmptyProfiler.prototype.next = function (name) {
    };
    EmptyProfiler.prototype.log = function (profiles) {
    };
    EmptyProfiler.prototype.logFlat = function () {
    };
    return EmptyProfiler;
}());
exports.EmptyProfiler = EmptyProfiler;
