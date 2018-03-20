WITH
last_block AS (SELECT "index" FROM blocks ORDER BY "index" DESC LIMIT 1),
first_block AS (SELECT "index" FROM blocks ORDER BY "index" ASC LIMIT 1)
SELECT "blockIndex"
FROM generate_series((SELECT "index" FROM first_block), (SELECT "index" FROM last_block)) block_range("blockIndex")
LEFT JOIN blocks ON blocks.index = block_range."blockIndex"
WHERE blocks.index IS NULL
ORDER BY "blockIndex"