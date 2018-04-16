"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ExternalBlockQueue = (function () {
    // p = new Profiler()
    function ExternalBlockQueue(client, blockIndex, config) {
        this.blocks = [];
        this.requests = [];
        this.listeners = [];
        this.client = client;
        this.blockIndex = blockIndex;
        this.config = {
            maxSize: config.maxSize || 10,
            minSize: config.minSize || 1,
        };
    }
    ExternalBlockQueue.prototype.getBlockIndex = function () {
        return this.blockIndex;
    };
    ExternalBlockQueue.prototype.removeRequest = function (blockIndex) {
        this.requests = this.requests.filter(function (r) { return r.blockIndex != blockIndex; });
    };
    ExternalBlockQueue.prototype.removeBlocks = function (blocks) {
        this.blocks = this.blocks.filter(function (b) { return blocks.every(function (b2) { return b2.index != b.index; }); });
    };
    ExternalBlockQueue.prototype.onResponse = function (blockIndex, block) {
        // this.p.stop(blockIndex + '-blockQueue')
        // console.log('onResponse block', blockIndex, block != undefined)
        this.removeRequest(blockIndex);
        if (!block) {
            if (this.listeners.length > 0) {
                var listeners = this.listeners;
                this.listeners = [];
                for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                    var listener = listeners_1[_i];
                    listener.reject(new Error("Error loading block"));
                }
            }
        }
        else {
            this.blocks.push(block);
            var listeners = this.listeners;
            if (this.listeners.length > 0) {
                var readyBlocks = this.getConsecutiveBlocks();
                if (readyBlocks.length > 0) {
                    this.listeners = [];
                    this.removeBlocks(readyBlocks);
                    for (var _a = 0, listeners_2 = listeners; _a < listeners_2.length; _a++) {
                        var listener = listeners_2[_a];
                        listener.resolve(readyBlocks);
                    }
                }
            }
            // else {
            //   console.log('no listeners')
            // }
        }
    };
    ExternalBlockQueue.prototype.addRequest = function (index) {
        var _this = this;
        // console.log('add block', index)
        var tryRequest = function () {
            return _this.client.getFullBlock(index)
                .then(function (block) { return _this.onResponse(index, block); })
                .catch(function (error) {
                console.error('Error reading block', index, error);
                return tryRequest();
                // this.onResponse(index, undefined)
            });
        };
        var promise = tryRequest();
        this.requests.push({
            blockIndex: index,
            promise: promise
        });
    };
    ExternalBlockQueue.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, remaining, count, i;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.highestBlockIndex === undefined)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.client.getHeighestBlockIndex()];
                    case 1:
                        _a.highestBlockIndex = _b.sent();
                        _b.label = 2;
                    case 2:
                        remaining = this.highestBlockIndex - this.blockIndex;
                        count = Math.min(remaining, this.config.maxSize) - this.requests.length;
                        console.log('Adding blocks', Array.from(new Array(count), function (x, i) { return i + _this.blockIndex; }).join(', '));
                        for (i = 0; i < count; ++i) {
                            this.addRequest(this.blockIndex++);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Ensures that batches of blocks are returned in consecutive order
    ExternalBlockQueue.prototype.getConsecutiveBlocks = function () {
        if (this.blocks.length == 0)
            return [];
        var results = this.blocks.concat([]).sort(function (a, b) { return a.index > b.index ? 1 : -1; });
        var oldestRequest = this.requests.map(function (r) { return r.blockIndex; }).sort()[0];
        var oldestResult = results[0].index;
        if (oldestRequest && oldestResult > oldestRequest) {
            // console.log('oldestRequest', oldestRequest, 'oldestResult', oldestResult)
            return [];
        }
        var blocks = [];
        var i = oldestResult;
        for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
            var r = results_1[_i];
            if (r.index != i++)
                break;
            blocks.push(r);
        }
        if (blocks.length < this.config.minSize && this.requests.length > 0) {
            return [];
        }
        return blocks;
    };
    ExternalBlockQueue.prototype.getBlocks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var readyBlocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.update()];
                    case 1:
                        _a.sent();
                        readyBlocks = this.getConsecutiveBlocks();
                        if (readyBlocks.length > 0) {
                            this.removeBlocks(readyBlocks);
                            return [2 /*return*/, Promise.resolve(readyBlocks)];
                        }
                        else if (this.requests.length == 0) {
                            return [2 /*return*/, Promise.resolve([])];
                        }
                        else {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    _this.listeners.push({
                                        resolve: resolve,
                                        reject: reject
                                    });
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return ExternalBlockQueue;
}());
exports.ExternalBlockQueue = ExternalBlockQueue;
