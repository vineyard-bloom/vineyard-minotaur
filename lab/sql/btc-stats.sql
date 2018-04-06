SELECT
  (SELECT COUNT(*) FROM transactions) AS "transaction count",
  (SELECT COUNT(*) FROM addresses) AS "address count",
  (SELECT COUNT(*) FROM blocks) AS "block count",
  (SELECT "blockIndex" FROM last_blocks) AS "last block",
  (SELECT "index" FROM blocks ORDER BY "index" DESC LIMIT 1) AS "highest block",
  (SELECT COUNT(*) FROM txins) AS "in count",
  (SELECT COUNT(*) FROM txouts) AS "out count"
