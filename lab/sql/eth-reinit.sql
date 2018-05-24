TRUNCATE transactions CASCADE;
TRUNCATE blocks CASCADE;
TRUNCATE addresses CASCADE;
TRUNCATE contracts CASCADE;
TRUNCATE token_transfers CASCADE;
TRUNCATE tokens CASCADE;
DELETE FROM currencies WHERE "id" > 2;

ALTER SEQUENCE addresses_id_seq RESTART;
ALTER SEQUENCE contracts_id_seq RESTART;
ALTER SEQUENCE currencies_id_seq RESTART;
ALTER SEQUENCE last_blocks_currency_seq RESTART;
ALTER SEQUENCE token_transfers_id_seq RESTART;
ALTER SEQUENCE transactions_id_seq RESTART;

UPDATE last_blocks SET "blockIndex" = NULL;