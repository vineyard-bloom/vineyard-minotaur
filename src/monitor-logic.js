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
var ScannedBlockStatus;
(function (ScannedBlockStatus) {
    ScannedBlockStatus[ScannedBlockStatus["_new"] = 0] = "_new";
    ScannedBlockStatus[ScannedBlockStatus["same"] = 1] = "same";
    ScannedBlockStatus[ScannedBlockStatus["replaced"] = 2] = "replaced";
})(ScannedBlockStatus = exports.ScannedBlockStatus || (exports.ScannedBlockStatus = {}));
function createBlockQueue(lastBlockDao, client, queueConfig, minConfirmations, startingBlockIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        let blockIndex = yield database_functions_1.getNextBlock(lastBlockDao);
        return new block_queue_1.ExternalBlockQueue(client, Math.max(blockIndex - minConfirmations, startingBlockIndex), queueConfig);
    });
}
exports.createBlockQueue = createBlockQueue;
// export async function findInvalidBlock(localSource: BlockSource, remoteSource: BlockSource): number | undefined {
//   let highestBlockIndex = await localSource.getHighestBlockIndex()
//   let localBlock = await localSource.getBlock(highestBlockIndex)
//   let foundInvalidBlocks = false
//
//   while (true) {
//     const remoteBlock = await remoteSource.getBlock(localBlock.index)
//     if (localBlock.hash == remoteBlock.hash) {
//       return foundInvalidBlocks
//         ? localBlock.index + 1
//         : undefined
//     }
//
//     foundInvalidBlocks = true
//     localBlock = await localSource.getBlock(localBlock.index - 1)
//   }
// }
function compareBlockHashes(ground, blocks) {
    const values = blocks.map(block => `(${block.index}, '${block.hash}')`);
    const sql = `
SELECT 
  temp."hash",
  temp."index",
  CASE 
    WHEN blocks.hash IS NULL THEN 0
    WHEN temp.hash = blocks.hash THEN 1
    ELSE 2
  END
  AS status   
FROM (VALUES ${values}) AS temp ("index", "hash")
LEFT JOIN blocks
ON temp."index" = blocks."index" 
  `;
    return ground.query(sql);
}
exports.compareBlockHashes = compareBlockHashes;
function mapBlocks(fullBlocks) {
    return (simple) => fullBlocks.filter(b => b.index == simple.index)[0];
}
exports.mapBlocks = mapBlocks;
function scanBlocks(blockQueue, saveFullBlocks, ground, lastBlockDao, config, profiler = new utility_1.EmptyProfiler()) {
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
            const blockComparisons = yield compareBlockHashes(ground, blocks);
            const blockMapper = mapBlocks(blocks);
            const newBlocks = blockComparisons.filter(b => b.status == ScannedBlockStatus._new)
                .map(blockMapper);
            const replacedBlocks = blockComparisons.filter(b => b.status == ScannedBlockStatus.replaced)
                .map(blockMapper);
            const blocksToDelete = replacedBlocks.map(block => block.index);
            console.log('Deleting blocks', blocksToDelete);
            profiler.start('deleteBlocks');
            yield database_functions_1.deleteFullBlocks(ground, blocksToDelete);
            profiler.stop('deleteBlocks');
            const blocksToSave = newBlocks.concat(replacedBlocks);
            console.log('Saving blocks', blocksToSave);
            profiler.start('saveBlocks');
            yield saveFullBlocks(blocksToSave);
            profiler.stop('saveBlocks');
            const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index;
            yield lastBlockDao.setLastBlock(lastBlockIndex);
            console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
        } while (true);
    });
}
exports.scanBlocks = scanBlocks;
// export async function checkBlockScanStatus(dao: BitcoinMonitorDao, block: { index: number, hash: string }): Promise<ScannedBlockStatus> {
//   const { index, hash } = block
//   const retrievedBlock = await dao.blockDao.getBlockByIndex(index)
//   if (!retrievedBlock) return ScannedBlockStatus._new
//   if (retrievedBlock.hash !== hash) return ScannedBlockStatus.replaced
//   return ScannedBlockStatus.same
// }
//# sourceMappingURL=monitor-logic.js.map