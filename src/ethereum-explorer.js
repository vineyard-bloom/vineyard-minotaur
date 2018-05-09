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
const monitor_dao_1 = require("./monitor-dao");
const vineyard_blockchain_1 = require("vineyard-blockchain");
const utility_1 = require("./utility");
const index_1 = require("./utility/index");
const database_functions_1 = require("./database-functions");
const monitor_logic_1 = require("./monitor-logic");
const explorer_helpers_1 = require("./explorer-helpers");
function getOrCreateAddressReturningId(addressCollection, externalAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const internalAddress = yield addressCollection.first({ address: externalAddress });
        return internalAddress
            ? internalAddress.id
            : (yield addressCollection.create({ address: externalAddress })).id;
    });
}
exports.getOrCreateAddressReturningId = getOrCreateAddressReturningId;
function createSingleCurrencyTransactionDao(model) {
    return {
        getTransactionByTxid: explorer_helpers_1.getTransactionByTxid.bind(null, model.Transaction),
        saveTransaction: (transaction) => __awaiter(this, void 0, void 0, function* () {
            yield model.Transaction.create(transaction);
        }),
        setStatus: monitor_dao_1.setStatus.bind(null, model.Transaction)
    };
}
exports.createSingleCurrencyTransactionDao = createSingleCurrencyTransactionDao;
function createEthereumExplorerDao(model) {
    return {
        blockDao: {
            saveBlock: (block) => explorer_helpers_1.saveSingleCurrencyBlock(model.Block, block)
        },
        lastBlockDao: monitor_dao_1.createIndexedLastBlockDao(model.ground, 2),
        // transactionDao: createSingleCurrencyTransactionDao(model),
        getOrCreateAddress: (externalAddress) => getOrCreateAddressReturningId(model.Address, externalAddress),
        ground: model.ground
    };
}
exports.createEthereumExplorerDao = createEthereumExplorerDao;
function gatherAddresses(blocks, contracts, tokenTransfers) {
    const addresses = {};
    for (let block of blocks) {
        for (let transaction of block.transactions) {
            if (transaction.to)
                addresses[transaction.to] = -1;
            if (transaction.from)
                addresses[transaction.from] = -1;
        }
    }
    for (let contract of contracts) {
        addresses[contract.address] = -1;
    }
    for (let transfer of tokenTransfers) {
        addresses[transfer.decoded.args.to] = -1;
        addresses[transfer.decoded.args.from] = -1;
    }
    return addresses;
}
function setAddress(getOrCreateAddress, addresses, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getOrCreateAddress(key);
        addresses[key] = id;
    });
}
function saveContracts(ground, contracts, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        if (contracts.length == 0)
            return Promise.resolve();
        const contractClauses = contracts.map(contract => `(${addresses[contract.address]}, (SELECT transactions.id FROM transactions WHERE txid = '${contract.txid}'), NOW(), NOW())`);
        const header = 'INSERT INTO "contracts" ("address", "transaction", "created", "modified") VALUES\n';
        const sql = header + contractClauses.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";';
        const contractRecords = (yield ground.query(sql))
            .map((c) => ({
            id: parseInt(c.id),
            address: parseInt(c.address)
        }));
        const tokenContracts = contracts.filter(c => c.contractType == vineyard_blockchain_1.blockchain.ContractType.token);
        if (tokenContracts.length == 0)
            return;
        const currencyContracts = yield database_functions_1.saveCurrencies(ground, tokenContracts);
        for (const bundle of currencyContracts) {
            const token = bundle.tokenContract;
            const address = addresses[token.address];
            const contractRecord = contractRecords.filter((c) => c.address === address)[0];
            if (!contractRecord) // Must be rescanning a block and already have a contract record
                continue;
            const currency = bundle.currency;
            yield ground.collections.Token.create({
                id: currency.id,
                contract: contractRecord.id,
                name: token.name,
                totalSupply: token.totalSupply,
                decimals: token.decimals.toNumber(),
                version: token.version,
                symbol: token.symbol
            });
        }
    });
}
function gatherNewContracts(blocks) {
    let result = [];
    for (let block of blocks) {
        result = result.concat(block.transactions
            .filter(t => t.newContract)
            .map(t => t.newContract));
    }
    return result;
}
function gatherTokenTranferInfo(ground, pairs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pairs.length == 0)
            return Promise.resolve([]);
        const addressClause = pairs.map(c => `('${c.address}', '${c.txid}')`).join(',\n');
        const sql = `
  SELECT 
    contracts.id AS "contractId",
    addresses.id AS "addressId", 
    addresses.address,
    tokens.id AS "tokenId",
    infos.column2 AS txid
  FROM addresses
  JOIN contracts ON contracts.address = addresses.id
  JOIN tokens ON tokens.contract = contracts.id
  JOIN (VALUES
  ${addressClause}
  ) infos
ON infos.column1 = addresses.address`;
        const records = yield ground.query(sql);
        return records.map(r => ({
            address: r.address,
            contractId: parseInt(r.contractId),
            tokenId: parseInt(r.tokenId),
            txid: r.txid
        }));
    });
}
function gatherTokenTransfers(ground, decodeEvent, events) {
    return __awaiter(this, void 0, void 0, function* () {
        let contractTransactions = events.map(e => ({ address: e.address, txid: e.transactionHash }));
        const infos = yield gatherTokenTranferInfo(ground, contractTransactions);
        return infos.map(info => {
            const event = events.filter(event => event.transactionHash == info.txid)[0];
            const decoded = decodeEvent(event);
            return {
                original: event,
                decoded: decoded,
                info: info
            };
        });
    });
}
function saveTokenTransfers(ground, tokenTransfers, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tokenTransfers.length == 0)
            return Promise.resolve();
        // const txs = await gatherContractTransactions(ground, tokenTransfers)
        const header = 'INSERT INTO "token_transfers" ("status", "transaction", "to", "from", "amount", "currency", "created", "modified") VALUES\n';
        const transactionClauses = tokenTransfers.map(bundle => {
            const to = addresses[bundle.decoded.args.to];
            const from = addresses[bundle.decoded.args.from];
            return `(0, (SELECT tx.id FROM transactions tx WHERE tx.txid = '${bundle.info.txid}'), ${to}, ${from}, ${bundle.decoded.args.value.toString()}, ${bundle.info.tokenId}, NOW(), NOW())`;
        });
        const sql = header + transactionClauses.join(',\n') + ' ON CONFLICT DO NOTHING;';
        return ground.querySingle(sql);
    });
}
function saveFullBlocks(dao, decodeTokenTransfer, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        const ground = dao.ground;
        const transactions = index_1.flatMap(blocks, b => b.transactions);
        const events = index_1.flatMap(transactions, t => t.events || []);
        const tokenTranfers = yield gatherTokenTransfers(ground, decodeTokenTransfer, events);
        const contracts = gatherNewContracts(blocks);
        const addresses = gatherAddresses(blocks, contracts, tokenTranfers);
        const lastBlockIndex = blocks.sort((a, b) => b.index - a.index)[0].index;
        yield Promise.all([
            database_functions_1.saveBlocks(ground, blocks),
            dao.lastBlockDao.setLastBlock(lastBlockIndex),
            database_functions_1.getOrCreateAddresses(dao.ground, addresses)
                .then(() => database_functions_1.saveSingleTransactions(ground, transactions, addresses))
                .then(() => saveContracts(ground, contracts, addresses))
                .then(() => saveTokenTransfers(ground, tokenTranfers, addresses))
        ]);
        console.log('Saved blocks; count', blocks.length, 'last', lastBlockIndex);
    });
}
function scanEthereumExplorerBlocks(dao, client, decodeTokenTransfer, config, profiler = new utility_1.EmptyProfiler()) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockQueue = yield monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue);
        const saver = (blocks) => saveFullBlocks(dao, decodeTokenTransfer, blocks);
        return monitor_logic_1.scanBlocks(blockQueue, saver, config, profiler);
    });
}
exports.scanEthereumExplorerBlocks = scanEthereumExplorerBlocks;
//# sourceMappingURL=ethereum-explorer.js.map