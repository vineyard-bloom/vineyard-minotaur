SELECT
  (SELECT COUNT(*) FROM transactions) AS "transaction count",
  (SELECT COUNT(*) FROM addresses) AS "address count",
  (SELECT COUNT(*) FROM blocks) AS "block count",
  (SELECT "blockIndex" FROM last_blocks) AS "last block",
  (SELECT "index" FROM blocks ORDER BY "index" DESC LIMIT 1) AS "highest block",
  (SELECT COUNT(*) FROM contracts) AS "contract count",
  (SELECT COUNT(*) FROM tokens) AS "token count",
  (SELECT COUNT(*) FROM token_transfers) AS "token transfer count",
  (SELECT COUNT(*) FROM blocks WHERE created >= current_timestamp - interval '1 hour') AS "blocks per hour",
  (SELECT COUNT(*) FROM transactions WHERE created >= current_timestamp - interval '1 hour') AS "txs per hour"