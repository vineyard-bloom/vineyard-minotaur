"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monitor_dao_1 = require("./monitor-dao");
const vineyard_blockchain_1 = require("vineyard-blockchain");
const utility_1 = require("./utility");
const index_1 = require("./utility/index");
const database_functions_1 = require("./database-functions");
const monitor_logic_1 = require("./monitor-logic");
const explorer_helpers_1 = require("./explorer-helpers");
async function getOrCreateAddressReturningId(addressCollection, externalAddress) {
    const internalAddress = await addressCollection.first({ address: externalAddress });
    return internalAddress
        ? internalAddress.id
        : (await addressCollection.create({ address: externalAddress })).id;
}
exports.getOrCreateAddressReturningId = getOrCreateAddressReturningId;
function createSingleCurrencyTransactionDao(model) {
    return {
        getTransactionByTxid: explorer_helpers_1.getTransactionByTxid.bind(null, model.Transaction),
        saveTransaction: async (transaction) => {
            await model.Transaction.create(transaction);
        },
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
async function setAddress(getOrCreateAddress, addresses, key) {
    const id = await getOrCreateAddress(key);
    addresses[key] = id;
}
async function saveContracts(ground, contracts, addresses) {
    if (contracts.length == 0)
        return Promise.resolve();
    const contractClauses = contracts.map(contract => `(${addresses[contract.address]}, (SELECT transactions.id FROM transactions WHERE txid = '${contract.txid}'), NOW(), NOW())`);
    const header = 'INSERT INTO "contracts" ("address", "transaction", "created", "modified") VALUES\n';
    const sql = header + contractClauses.join(',\n') + ' ON CONFLICT DO NOTHING RETURNING "id", "address";';
    const contractRecords = (await ground.query(sql))
        .map((c) => ({
        id: parseInt(c.id),
        address: parseInt(c.address)
    }));
    const tokenContracts = contracts.filter(c => c.contractType == vineyard_blockchain_1.blockchain.ContractType.token);
    if (tokenContracts.length == 0)
        return;
    // tokenContracts must be passed in as type TokenContracts, must have 'name'
    const currencyContracts = await database_functions_1.saveCurrencies(ground, tokenContracts);
    for (const bundle of currencyContracts) {
        const token = bundle.tokenContract;
        const address = addresses[token.address];
        const contractRecord = contractRecords.filter((c) => c.address === address)[0];
        if (!contractRecord) // Must be rescanning a block and already have a contract record
            continue;
        const currency = bundle.currency;
        await ground.collections.Token.create({
            id: currency.id,
            contract: contractRecord.id,
            name: token.name,
            totalSupply: token.totalSupply,
            decimals: token.decimals.toNumber(),
            version: token.version,
            symbol: token.symbol
        });
    }
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
async function gatherTokenTransferInfo(ground, pairs) {
    // Add error handling pairs.length == 0? Currently returning empty [] which seems intentional
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
    const records = await ground.query(sql);
    return records.map(r => ({
        address: r.address,
        contractId: parseInt(r.contractId),
        tokenId: parseInt(r.tokenId),
        txid: r.txid
    }));
}
async function gatherTokenTransfers(ground, decodeEvent, events) {
    let contractTransactions = events.map(e => ({ address: e.address, txid: e.transactionHash }));
    const infos = await gatherTokenTransferInfo(ground, contractTransactions);
    return infos.map(info => {
        const event = events.filter(event => event.transactionHash == info.txid)[0];
        const decoded = decodeEvent(event);
        return {
            original: event,
            decoded: decoded,
            info: info
        };
    });
}
async function saveTokenTransfers(ground, tokenTransfers, addresses) {
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
}
async function saveFullBlocks(ground, decodeTokenTransfer, blocks) {
    const transactions = index_1.flatMap(blocks, b => b.transactions);
    const events = index_1.flatMap(transactions, t => t.events || []);
    const tokenTranfers = await gatherTokenTransfers(ground, decodeTokenTransfer, events);
    const contracts = gatherNewContracts(blocks);
    const addresses = gatherAddresses(blocks, contracts, tokenTranfers);
    await Promise.all([
        database_functions_1.saveBlocks(ground, blocks),
        database_functions_1.getOrCreateAddresses(ground, addresses)
            .then(() => database_functions_1.saveSingleTransactions(ground, transactions, addresses))
            .then(() => saveContracts(ground, contracts, addresses))
            .then(() => saveTokenTransfers(ground, tokenTranfers, addresses))
    ]);
}
async function scanEthereumExplorerBlocks(dao, client, decodeTokenTransfer, config, profiler = new utility_1.EmptyProfiler()) {
    const blockQueue = await monitor_logic_1.createBlockQueue(dao.lastBlockDao, client, config.queue, config.minConfirmations, 0);
    const saver = (blocks) => saveFullBlocks(dao.ground, decodeTokenTransfer, blocks);
    return monitor_logic_1.scanBlocks(blockQueue, saver, dao.ground, dao.lastBlockDao, config, profiler);
}
exports.scanEthereumExplorerBlocks = scanEthereumExplorerBlocks;
//# sourceMappingURL=ethereum-explorer.js.map