SELECT index, NOW() - created AS downtime, created AS "most recent" FROM blocks
ORDER BY blocks.index DESC
LIMIT 1
