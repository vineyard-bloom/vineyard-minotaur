"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function getOrCreateAddresses(ground, addresses) {
    {
        const addressClauses = [];
        for (let i in addresses) {
            addressClauses.push(`'${i}'`);
        }
        if (addressClauses.length == 0)
            return Promise.resolve();
        const header = `SELECT "id", "address" FROM addresses
  WHERE "address" IN (
  `;
        const sql = header + addressClauses.join(',\n') + ');';
        const rows = await ground.query(sql);
        for (let row of rows) {
            addresses[row.address.trim()] = parseInt(row.id);
        }
    }
    {
        const inserts = [];
        for (let i in addresses) {
            const value = addresses[i];
            if (value === -1) {
                inserts.push(`('${i}', NOW(), NOW())`);
            }
        }
        if (inserts.length == 0)
            return Promise.resolve();
        const insertHeader = 'INSERT INTO "addresses" ("address", "created", "modified") VALUES\n';
        const sql = insertHeader + inserts.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";';
        const rows = await ground.query(sql);
        for (let row of rows) {
            addresses[row.address.trim()] = parseInt(row.id);
        }
    }
}
exports.getOrCreateAddresses = getOrCreateAddresses;
async function getOrCreateAddresses2(ground, addresses) {
    const existingAddresses = await getExistingAddresses(ground, addresses);
    const newlySavedAddresses = await saveNewAddresses(ground, arrayDiff(addresses, Object.keys(existingAddresses)));
    return Object.assign({}, existingAddresses, newlySavedAddresses);
}
exports.getOrCreateAddresses2 = getOrCreateAddresses2;
async function getExistingAddresses(ground, addresses) {
    const addressMap = {};
    if (addresses.length === 0)
        return addressMap;
    const header = `SELECT "id", "address" FROM addresses WHERE "address" IN (`;
    const sql = header + addresses.map(add => `'${add}'`).join(',\n') + ');';
    const rows = await ground.query(sql);
    for (let row of rows) {
        addressMap[row.address.trim()] = parseInt(row.id);
    }
    return addressMap;
}
exports.getExistingAddresses = getExistingAddresses;
async function saveNewAddresses(ground, addresses) {
    const addressMap = {};
    if (addresses.length === 0)
        return addressMap;
    const inserts = addresses.map(add => `('${add}', NOW(), NOW())`);
    const insertHeader = 'INSERT INTO "addresses" ("address", "created", "modified") VALUES\n';
    const sql = insertHeader + inserts.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";';
    const rows = await ground.query(sql);
    for (let row of rows) {
        addressMap[row.address.trim()] = parseInt(row.id);
    }
    return addressMap;
}
exports.saveNewAddresses = saveNewAddresses;
function arrayDiff(a1, a2) {
    const set2 = new Set(a2);
    return a1.filter(x => !set2.has(x));
}
exports.arrayDiff = arrayDiff;
async function saveBlocks(ground, blocks) {
    if (blocks.length === 0) {
        throw new Error('block values must not be empty');
    }
    else {
        const header = 'INSERT INTO "blocks" ("index", "hash", "timeMined", "created", "modified") VALUES\n';
        let inserts = [];
        for (let block of blocks) {
            inserts.push(`(${block.index}, '${block.hash}', '${block.timeMined.toISOString()}', NOW(), NOW())`);
        }
        const sql = header + inserts.join(',\n') + ' ON CONFLICT DO NOTHING;';
        return ground.querySingle(sql);
    }
}
exports.saveBlocks = saveBlocks;
async function saveCurrencies(ground, tokenContracts) {
    const result = [];
    for (let contract of tokenContracts) {
        const record = await ground.collections.Currency.create({
            name: contract.name
        });
        result.push({
            currency: record,
            tokenContract: contract
        });
    }
    return result;
}
exports.saveCurrencies = saveCurrencies;
async function getNextBlock(lastBlockDao) {
    const lastBlockIndex = await lastBlockDao.getLastBlock();
    return typeof lastBlockIndex === 'number' ? lastBlockIndex + 1 : 0;
}
exports.getNextBlock = getNextBlock;
function saveSingleTransactions(ground, transactions, addresses) {
    const header = 'INSERT INTO "transactions" ("status", "txid", "to", "from", "amount", "fee", "nonce", "currency", "timeReceived", "blockIndex", "created", "modified") VALUES\n';
    const transactionClauses = transactions.map(t => {
        const to = t.to ? addresses[t.to] : 'NULL';
        const from = t.from ? addresses[t.from] : 'NULL';
        return `(${t.status}, '${t.txid}', ${to}, ${from}, ${t.amount}, ${t.fee}, ${t.nonce}, 2, '${t.timeReceived.toISOString()}', ${t.blockIndex}, NOW(), NOW())`;
    });
    if (transactionClauses.length == 0)
        return Promise.resolve();
    const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
    return ground.querySingle(sql);
}
exports.saveSingleTransactions = saveSingleTransactions;
async function deleteFullBlocks(ground, indexes) {
    if (indexes.length === 0) {
        return;
    }
    const header = 'DELETE FROM blocks WHERE index IN ';
    const sql = header + '(' + indexes.join(', ') + ');';
    await ground.querySingle(sql);
}
exports.deleteFullBlocks = deleteFullBlocks;
//# sourceMappingURL=database-functions.js.map