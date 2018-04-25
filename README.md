# Vineyard Minotaur

Monitors blockchains using the Vineyard Blockchain Protocol

## Documentation

[Here's the documentation.](doc/index.md)

## Installing the Ethereum Explorer Monitor

The Ethereum Explorer Monitor needs a Node.js server, a Geth node and a Postgres database.

On the Node.js server run the following commands:

1. Run `git clone git@github.com:vineyard-bloom/vineyard-minotaur.git`
2. Run `cd vineyard-minotaur`
3. Run `cp config/config-eth-sample.ts config/config-eth.ts`.
4. Run `cp test/config/config-eth-sample.ts test/config/config-eth.ts`
5. Edit the database and ethereum settings in `config-eth.ts`.
6. Run the SQL script `lab/sql/ethereum-explorer-db.sql` in the target database.
7. Run `yarn` or `npm i`
8. Run `tsc` to compile the config.  (The rest of the TypeScript should already be compiled to JavaScript)
9. To start the service run either:
    * `node scripts/eth-scan` or
    * `pm2 start scripts/eth-scan.js`

## Installing the Bitcoin Explorer Monitor

The Bitcoin Explorer Monitor needs a Node.js server, a Bitcoind node and a Postgres database.

On the Node.js server run the following commands:

TODO: NEED WORK
1. Run `git clone git@github.com:vineyard-bloom/vineyard-minotaur.git`
2. Run `cd vineyard-minotaur`
3. Run `cp config/config-btc-sample.ts config/config-btc.ts`.
5. Edit the database and bitcoin settings in `config-btc.ts`.
7. Run `yarn` or `npm i`
8. Run `tsc` to compile the config.  (The rest of the TypeScript should already be compiled to JavaScript)
9. To start the service run either:
    * `node scripts/btc-scan` or
    * `pm2 start scripts/btc-scan.js`

