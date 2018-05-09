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
const database_functions_1 = require("./database-functions");
const utility_1 = require("./utility");
const block_queue_1 = require("./block-queue");
function createBlockQueue(lastBlockDao, client, queueConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let blockIndex = yield database_functions_1.getNextBlock(lastBlockDao);
        return new block_queue_1.ExternalBlockQueue(client, blockIndex, queueConfig);
    });
}
exports.createBlockQueue = createBlockQueue;
function scanBlocks(blockQueue, saveFullBlocks, config, profiler = new utility_1.EmptyProfiler()) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        do {
            const elapsed = Date.now() - startTime;
            if (config.maxMilliseconds && elapsed > config.maxMilliseconds) {
                console.log('Reached timeout of ', elapsed, 'milliseconds');
                console.log('Canceled blocks', blockQueue.requests.map((b) => b.blockIndex).join(', '));
                break;
            }
            profiler.start('getBlocks');
            const blocks = yield blockQueue.getBlocks();
            profiler.stop('getBlocks');
            if (blocks.length == 0) {
                console.log('No more blocks found.');
                break;
            }
            console.log('Saving blocks', blocks.map((b) => b.index).join(', '));
            profiler.start('saveBlocks');
            yield saveFullBlocks(blocks);
            profiler.stop('saveBlocks');
        } while (true);
    });
}
exports.scanBlocks = scanBlocks;
//# sourceMappingURL=monitor-logic.js.map