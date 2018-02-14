SELECT
  (SELECT COUNT(*) FROM transactions) AS transaction_count,
  (SELECT COUNT(*) FROM addresses) AS address_count,
  (SELECT COUNT(*) FROM blocks) AS block_count,
  (SELECT "blockIndex" FROM last_blocks) AS last_block,
  (SELECT "index" FROM blocks ORDER BY "index" DESC LIMIT 1) AS highest_block