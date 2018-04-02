# Vineyard Minotaur

Monitors blockchains using the Vineyard Blockchain Protocol

## Installing the Ethereum Explorer Monitor

The Ethereum Explorer Monitor needs a Node.js server, a Geth node and a Postgres database.

On the Node.js server run the following commands:

1. `cp config/config-sample.ts config/config.ts`.
2. Edit the database and ethereum settings in `config.ts`.
3. Run the SQL script `lab/sql/ethereum-explorer-db.sql` in the target database.
4. Run `yarn` or `npm i`
5. Run `tsc` to compile the config.  (The rest of the TypeScript should already be compiled to JavaScript)
6. To start the service run either:
    * `node scripts/eth-scan` or
    * `pm2 start scripts/eth-scan.js`

