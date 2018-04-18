CREATE SEQUENCE addresses_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."addresses" (
    "id" bigint DEFAULT nextval('addresses_id_seq') NOT NULL,
    "address" character(42) DEFAULT '' NOT NULL,
    "balance" numeric DEFAULT '0' NOT NULL,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "addresses_address_key" UNIQUE ("address"),
    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE TABLE "public"."blocks" (
    "index" integer NOT NULL,
    "hash" character(66) DEFAULT '' NOT NULL,
    "timeMined" timestamptz NOT NULL,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "blocks_hash_key" UNIQUE ("hash"),
    CONSTRAINT "blocks_pkey" PRIMARY KEY ("index")
) WITH (oids = false);


CREATE SEQUENCE currencies_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."currencies" (
    "id" integer DEFAULT nextval('currencies_id_seq') NOT NULL,
    "name" character varying(255) DEFAULT '' NOT NULL,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "currencies" ("name", "created", "modified") VALUES
('Bitcoin',	'2018-03-13 12:29:12.33-06',	'2018-03-13 12:29:12.33-06'),
('Ethereum',	'2018-03-13 12:29:12.36-06',	'2018-03-13 12:29:12.36-06');


CREATE SEQUENCE transactions_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."transactions" (
    "id" bigint DEFAULT nextval('transactions_id_seq') NOT NULL,
    "status" smallint DEFAULT '0' NOT NULL,
    "txid" character(66) DEFAULT '' NOT NULL,
    "currency" integer DEFAULT '0' NOT NULL,
    "to" bigint,
    "from" bigint DEFAULT '0' NOT NULL,
    "amount" numeric DEFAULT '0' NOT NULL,
    "fee" numeric DEFAULT '0' NOT NULL,
    "nonce" bigint DEFAULT '0' NOT NULL,
    "timeReceived" timestamptz NOT NULL,
    "blockIndex" bigint DEFAULT '0' NOT NULL,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "transactions_txid" UNIQUE ("txid"),
    CONSTRAINT "transactions_currency_fkey" FOREIGN KEY (currency) REFERENCES currencies(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "transactions_from_fkey" FOREIGN KEY ("from") REFERENCES addresses(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "transactions_to_fkey" FOREIGN KEY ("to") REFERENCES addresses(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE
) WITH (oids = false);


CREATE SEQUENCE contracts_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."contracts" (
    "id" bigint DEFAULT nextval('contracts_id_seq') NOT NULL,
    "address" bigint DEFAULT '0' NOT NULL,
    "transaction" bigint,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "contracts_address_key" UNIQUE ("address"),
    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "contracts_address_fkey" FOREIGN KEY (address) REFERENCES addresses(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "contracts_transaction_fkey" FOREIGN KEY (transaction) REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE
) WITH (oids = false);


CREATE SEQUENCE last_blocks_currency_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."last_blocks" (
    "currency" integer DEFAULT nextval('last_blocks_currency_seq') NOT NULL,
    "blockIndex" bigint,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "last_blocks_pkey" PRIMARY KEY ("currency")
) WITH (oids = false);

INSERT INTO "last_blocks" ("currency", "blockIndex", "created", "modified") VALUES
(2,	NULL,	'2018-03-13 12:29:12.368-06',	'2018-03-13 12:29:12.368-06');

CREATE SEQUENCE token_transfers_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."token_transfers" (
    "id" bigint DEFAULT nextval('token_transfers_id_seq') NOT NULL,
    "status" smallint DEFAULT '0' NOT NULL,
    "transaction" bigint DEFAULT '0' NOT NULL,
    "currency" integer DEFAULT '0' NOT NULL,
    "to" bigint,
    "from" bigint DEFAULT '0' NOT NULL,
    "amount" numeric DEFAULT '0' NOT NULL,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "token_transfers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "token_transfers_transaction" UNIQUE ("transaction"),
    CONSTRAINT "token_transfers_currency_fkey" FOREIGN KEY (currency) REFERENCES currencies(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "token_transfers_from_fkey" FOREIGN KEY ("from") REFERENCES addresses(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "token_transfers_to_fkey" FOREIGN KEY ("to") REFERENCES addresses(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE,
    CONSTRAINT "token_transfers_transaction_fkey" FOREIGN KEY (transaction) REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
) WITH (oids = false);


CREATE TABLE "public"."tokens" (
    "id" bigint NOT NULL,
    "contract" bigint DEFAULT '0' NOT NULL,
    "name" character varying(255) DEFAULT '' NOT NULL,
    "totalSupply" numeric DEFAULT '0' NOT NULL,
    "decimals" smallint DEFAULT '0' NOT NULL,
    "version" character varying(255) DEFAULT '' NOT NULL,
    "symbol" character varying(255) DEFAULT '' NOT NULL,
    "created" timestamptz NOT NULL,
    "modified" timestamptz NOT NULL,
    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tokens_contract_fkey" FOREIGN KEY (contract) REFERENCES contracts(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
) WITH (oids = false);
