--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.5
-- Dumped by pg_dump version 9.6.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: addresses; Type: TABLE; Schema: public; 
--

CREATE TABLE addresses (
    id bigint NOT NULL,
    address character varying(255) DEFAULT ''::character varying NOT NULL,
    balance numeric DEFAULT 0 NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE addresses_id_seq OWNED BY addresses.id;


--
-- Name: blocks; Type: TABLE; Schema: public; 
--

CREATE TABLE blocks (
    index integer NOT NULL,
    number integer DEFAULT 0 NOT NULL,
    hash character(66) DEFAULT ''::bpchar NOT NULL,
    "timeMined" timestamp with time zone NOT NULL,
    coinbase character(66) DEFAULT ''::bpchar NOT NULL,
    difficulty numeric DEFAULT 0 NOT NULL,
    "parentHash" character(66) DEFAULT ''::bpchar NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


--
-- Name: currencies; Type: TABLE; Schema: public; 
--

CREATE TABLE currencies (
    id integer NOT NULL,
    name character varying(255) DEFAULT ''::character varying NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


--
-- Name: currencies_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE currencies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public;
--

ALTER SEQUENCE currencies_id_seq OWNED BY currencies.id;


--
-- Name: last_blocks; Type: TABLE; Schema: public; 
--

CREATE TABLE last_blocks (
    currency integer NOT NULL,
    "blockIndex" bigint,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


--
-- Name: last_blocks_currency_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE last_blocks_currency_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: last_blocks_currency_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE last_blocks_currency_seq OWNED BY last_blocks.currency;


--
-- Name: transactions; Type: TABLE; Schema: public;
--

CREATE TABLE transactions (
    id bigint NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    txid character(66) DEFAULT ''::bpchar NOT NULL,
    currency integer DEFAULT 0 NOT NULL,
    fee numeric DEFAULT 0 NOT NULL,
    nonce bigint DEFAULT 0 NOT NULL,
    "timeReceived" timestamp with time zone NOT NULL,
    "blockIndex" integer DEFAULT 0 NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public;
--

CREATE SEQUENCE transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE transactions_id_seq OWNED BY transactions.id;


--
-- Name: txins; Type: TABLE; Schema: public;
--

CREATE TABLE txins (
    transaction bigint DEFAULT 0 NOT NULL,
    index integer NOT NULL,
    "sourceTransaction" bigint,
    "sourceIndex" bigint,
    "scriptSigHex" character varying(255) DEFAULT NULL::character varying,
    "scriptSigAsm" character varying(255) DEFAULT NULL::character varying,
    sequence bigint DEFAULT 0 NOT NULL,
    coinbase character varying(255) DEFAULT NULL::character varying,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


--
-- Name: txins_index_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE txins_index_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: txins_index_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE txins_index_seq OWNED BY txins.index;


--
-- Name: txouts; Type: TABLE; Schema: public; 
--

CREATE TABLE txouts (
    transaction bigint DEFAULT 0 NOT NULL,
    index integer NOT NULL,
    "scriptPubKeyHex" character varying(255) DEFAULT ''::character varying NOT NULL,
    "scriptPubKeyAsm" character varying(255) DEFAULT ''::character varying NOT NULL,
    address bigint DEFAULT 0 NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


--
-- Name: addresses id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY addresses ALTER COLUMN id SET DEFAULT nextval('addresses_id_seq'::regclass);


--
-- Name: currencies id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY currencies ALTER COLUMN id SET DEFAULT nextval('currencies_id_seq'::regclass);


--
-- Name: last_blocks currency; Type: DEFAULT; Schema: public;
--

ALTER TABLE ONLY last_blocks ALTER COLUMN currency SET DEFAULT nextval('last_blocks_currency_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; 

ALTER TABLE ONLY transactions ALTER COLUMN id SET DEFAULT nextval('transactions_id_seq'::regclass);


--
-- Name: txins index; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY txins ALTER COLUMN index SET DEFAULT nextval('txins_index_seq'::regclass);


--
-- Name: addresses addresses_address_key; Type: CONSTRAINT; Schema: public; 

ALTER TABLE ONLY addresses
    ADD CONSTRAINT addresses_address_key UNIQUE (address);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_hash_key; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY blocks
    ADD CONSTRAINT blocks_hash_key UNIQUE (hash);


--
-- Name: blocks blocks_parentHash_key; Type: CONSTRAINT; Schema: public;
--

ALTER TABLE ONLY blocks
    ADD CONSTRAINT "blocks_parentHash_key" UNIQUE ("parentHash");


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (index);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: last_blocks last_blocks_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY last_blocks
    ADD CONSTRAINT last_blocks_pkey PRIMARY KEY (currency);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: txins txins_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY txins
    ADD CONSTRAINT txins_pkey PRIMARY KEY (transaction, index);


--
-- Name: txouts txouts_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY txouts
    ADD CONSTRAINT txouts_pkey PRIMARY KEY (transaction, index);


--
-- Name: transactions transactions_blockIndex_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT "transactions_blockIndex_fkey" FOREIGN KEY ("blockIndex") REFERENCES blocks(index) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_currency_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_currency_fkey FOREIGN KEY (currency) REFERENCES currencies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: txins txins_sourceTransaction_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY txins
    ADD CONSTRAINT "txins_sourceTransaction_fkey" FOREIGN KEY ("sourceTransaction") REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: txins txins_transaction_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY txins
    ADD CONSTRAINT txins_transaction_fkey FOREIGN KEY (transaction) REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: txouts txouts_address_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY txouts
    ADD CONSTRAINT txouts_address_fkey FOREIGN KEY (address) REFERENCES addresses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: txouts txouts_transaction_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY txouts
    ADD CONSTRAINT txouts_transaction_fkey FOREIGN KEY (transaction) REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

