--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
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


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: addresses; Type: TABLE; Schema: public; 
--

CREATE TABLE public.addresses (
    id bigint NOT NULL,
    address character(42) DEFAULT ''::bpchar NOT NULL,
    balance numeric DEFAULT 0 NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.addresses OWNER TO minotaur;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.addresses_id_seq OWNER TO minotaur;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: blocks; Type: TABLE; Schema: public; 
--

CREATE TABLE public.blocks (
    index integer NOT NULL,
    hash character(66) DEFAULT ''::bpchar NOT NULL,
    "timeMined" timestamp with time zone NOT NULL,
    bloom text NOT NULL,
    coinbase character(42) DEFAULT ''::bpchar NOT NULL,
    difficulty bigint DEFAULT 0 NOT NULL,
    "extraData" character varying(255) DEFAULT ''::character varying NOT NULL,
    "gasLimit" bigint DEFAULT 0 NOT NULL,
    "parentHash" character(66) DEFAULT ''::bpchar NOT NULL,
    "receiptTrie" character(66) DEFAULT ''::bpchar NOT NULL,
    "stateRoot" character(66) DEFAULT ''::bpchar NOT NULL,
    "transactionsTrie" character(66) DEFAULT ''::bpchar NOT NULL,
    rlp character varying(255) DEFAULT ''::character varying NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.blocks OWNER TO minotaur;

--
-- Name: contracts; Type: TABLE; Schema: public; 
--

CREATE TABLE public.contracts (
    id bigint NOT NULL,
    address bigint DEFAULT 0 NOT NULL,
    transaction bigint,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.contracts OWNER TO minotaur;

--
-- Name: contracts_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contracts_id_seq OWNER TO minotaur;

--
-- Name: contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.contracts_id_seq OWNED BY public.contracts.id;


--
-- Name: currencies; Type: TABLE; Schema: public; 
--

CREATE TABLE public.currencies (
    id integer NOT NULL,
    name character varying(255) DEFAULT ''::character varying NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.currencies OWNER TO minotaur;

--
-- Name: currencies_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.currencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.currencies_id_seq OWNER TO minotaur;

--
-- Name: currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.currencies_id_seq OWNED BY public.currencies.id;


--
-- Name: internal_transactions; Type: TABLE; Schema: public; 
--

CREATE TABLE public.internal_transactions (
    id bigint NOT NULL,
    transaction bigint DEFAULT 0 NOT NULL,
    "to" bigint DEFAULT 0 NOT NULL,
    "from" bigint DEFAULT 0 NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.internal_transactions OWNER TO minotaur;

--
-- Name: internal_transactions_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.internal_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.internal_transactions_id_seq OWNER TO minotaur;

--
-- Name: internal_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.internal_transactions_id_seq OWNED BY public.internal_transactions.id;


--
-- Name: last_blocks; Type: TABLE; Schema: public; 
--

CREATE TABLE public.last_blocks (
    currency integer NOT NULL,
    "blockIndex" bigint,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.last_blocks OWNER TO minotaur;

--
-- Name: last_blocks_currency_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.last_blocks_currency_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.last_blocks_currency_seq OWNER TO minotaur;

--
-- Name: last_blocks_currency_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.last_blocks_currency_seq OWNED BY public.last_blocks.currency;


--
-- Name: token_transfers; Type: TABLE; Schema: public; 
--

CREATE TABLE public.token_transfers (
    id bigint NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    transaction bigint DEFAULT 0 NOT NULL,
    currency integer DEFAULT 0 NOT NULL,
    "to" bigint,
    "from" bigint DEFAULT 0 NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.token_transfers OWNER TO minotaur;

--
-- Name: token_transfers_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.token_transfers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.token_transfers_id_seq OWNER TO minotaur;

--
-- Name: token_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.token_transfers_id_seq OWNED BY public.token_transfers.id;


--
-- Name: tokens; Type: TABLE; Schema: public; 
--

CREATE TABLE public.tokens (
    id bigint NOT NULL,
    contract bigint DEFAULT 0 NOT NULL,
    name character varying(255) DEFAULT ''::character varying NOT NULL,
    "totalSupply" numeric DEFAULT 0 NOT NULL,
    decimals smallint DEFAULT 0 NOT NULL,
    version character varying(255) DEFAULT ''::character varying NOT NULL,
    symbol character varying(255) DEFAULT ''::character varying NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.tokens OWNER TO minotaur;

--
-- Name: transactions; Type: TABLE; Schema: public; 
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    txid character(66) DEFAULT ''::bpchar NOT NULL,
    currency integer DEFAULT 0 NOT NULL,
    "to" bigint,
    "from" bigint DEFAULT 0 NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    fee numeric DEFAULT 0 NOT NULL,
	"gasPrice" numeric DEFAULT '0' NOT NULL,
    nonce bigint DEFAULT 0 NOT NULL,
    "timeReceived" timestamp with time zone NOT NULL,
    "blockIndex" bigint DEFAULT 0 NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL
);


ALTER TABLE public.transactions OWNER TO minotaur;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO minotaur;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: addresses id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: contracts id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.contracts ALTER COLUMN id SET DEFAULT nextval('public.contracts_id_seq'::regclass);


--
-- Name: currencies id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.currencies ALTER COLUMN id SET DEFAULT nextval('public.currencies_id_seq'::regclass);


--
-- Name: internal_transactions id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.internal_transactions ALTER COLUMN id SET DEFAULT nextval('public.internal_transactions_id_seq'::regclass);


--
-- Name: last_blocks currency; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.last_blocks ALTER COLUMN currency SET DEFAULT nextval('public.last_blocks_currency_seq'::regclass);


--
-- Name: token_transfers id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.token_transfers ALTER COLUMN id SET DEFAULT nextval('public.token_transfers_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: addresses addresses_address_key; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_address_key UNIQUE (address);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_hash_key; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_hash_key UNIQUE (hash);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (index);


--
-- Name: contracts contracts_address_key; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_address_key UNIQUE (address);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: internal_transactions internal_transactions_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.internal_transactions
    ADD CONSTRAINT internal_transactions_pkey PRIMARY KEY (id);


--
-- Name: last_blocks last_blocks_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.last_blocks
    ADD CONSTRAINT last_blocks_pkey PRIMARY KEY (currency);


--
-- Name: token_transfers token_transfers_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.token_transfers
    ADD CONSTRAINT token_transfers_pkey PRIMARY KEY (id);


--
-- Name: token_transfers token_transfers_transaction_key; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.token_transfers
    ADD CONSTRAINT token_transfers_transaction_key UNIQUE (transaction);


--
-- Name: tokens tokens_contract_key; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_contract_key UNIQUE (contract);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_txid_key; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_txid_key UNIQUE (txid);


--
-- Name: contracts contracts_address_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_address_fkey FOREIGN KEY (address) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contracts contracts_transaction_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_transaction_fkey FOREIGN KEY (transaction) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: internal_transactions internal_transactions_from_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.internal_transactions
    ADD CONSTRAINT internal_transactions_from_fkey FOREIGN KEY ("from") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: internal_transactions internal_transactions_to_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.internal_transactions
    ADD CONSTRAINT internal_transactions_to_fkey FOREIGN KEY ("to") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: internal_transactions internal_transactions_transaction_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.internal_transactions
    ADD CONSTRAINT internal_transactions_transaction_fkey FOREIGN KEY (transaction) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: token_transfers token_transfers_currency_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.token_transfers
    ADD CONSTRAINT token_transfers_currency_fkey FOREIGN KEY (currency) REFERENCES public.currencies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: token_transfers token_transfers_from_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.token_transfers
    ADD CONSTRAINT token_transfers_from_fkey FOREIGN KEY ("from") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: token_transfers token_transfers_to_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.token_transfers
    ADD CONSTRAINT token_transfers_to_fkey FOREIGN KEY ("to") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: token_transfers token_transfers_transaction_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.token_transfers
    ADD CONSTRAINT token_transfers_transaction_fkey FOREIGN KEY (transaction) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tokens tokens_contract_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_contract_fkey FOREIGN KEY (contract) REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_currency_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_currency_fkey FOREIGN KEY (currency) REFERENCES public.currencies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_from_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_from_fkey FOREIGN KEY ("from") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_to_fkey; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_to_fkey FOREIGN KEY ("to") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

