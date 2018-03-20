"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class ExternalBlockQueue {
    // p = new Profiler()
    constructor(client, blockIndex, maxSize = 40) {
        this.blocks = [];
        this.requests = [];
        this.listeners = [];
        this.client = client;
        this.blockIndex = blockIndex;
        this.maxSize = maxSize;
    }
    getBlockIndex() {
        return this.blockIndex;
    }
    removeRequest(blockIndex) {
        this.requests = this.requests.filter(r => r.blockIndex != blockIndex);
    }
    onResponse(blockIndex, block) {
        // this.p.stop(blockIndex + '-blockQueue')
        this.removeRequest(blockIndex);
        if (!block) {
            if (this.listeners.length > 0) {
                const listeners = this.listeners;
                this.listeners = [];
                for (let listener of listeners) {
                    listener.reject(new Error("Error loading block"));
                }
            }
        }
        else {
            if (this.listeners.length > 0) {
                const listeners = this.listeners;
                this.listeners = [];
                for (let listener of listeners) {
                    listener.resolve([block]);
                }
            }
            else {
                this.blocks.push(block);
            }
        }
    }
    addRequest(index) {
        // console.log('add block', index)
        const tryRequest = () => this.client.getFullBlock(index)
            .then(block => this.onResponse(index, block))
            .catch((error) => {
            console.error('Error reading block', index, error);
            return tryRequest();
            // this.onResponse(index, undefined)
        });
        const promise = tryRequest();
        this.requests.push({
            blockIndex: index,
            promise: promise
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.highestBlockIndex === undefined) {
                this.highestBlockIndex = yield this.client.getBlockIndex();
            }
            const remaining = this.highestBlockIndex - this.blockIndex;
            const count = Math.min(remaining, this.maxSize) - this.requests.length;
            console.log('Adding blocks', Array.from(new Array(count), (x, i) => i + this.blockIndex).join(', '));
            for (let i = 0; i < count; ++i) {
                this.addRequest(this.blockIndex++);
            }
        });
    }
    getBlocks() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.update();
            if (this.blocks.length > 0) {
                const result = this.blocks;
                this.blocks = [];
                return Promise.resolve(result);
            }
            else if (this.requests.length == 0) {
                return Promise.resolve([]);
            }
            else {
                return new Promise((resolve, reject) => {
                    this.listeners.push({
                        resolve: resolve,
                        reject: reject
                    });
                });
            }
        });
    }
}
exports.ExternalBlockQueue = ExternalBlockQueue;
//# sourceMappingURL=block-queue.js.map