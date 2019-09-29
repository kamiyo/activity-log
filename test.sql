UPDATE "timeStats" SET average = stats.avg, stddev = stats.stddev
FROM (
  SELECT
    TYPE,
    AVG("timeBeforePrev") as avg,
    make_interval(secs=>stddev(EXTRACT(EPOCH FROM "timeBeforePrev"))) as stddev
  FROM activity GROUP BY "type"
) AS stats
WHERE stats.type = "timeStats".type
RETURNING "timeStats".*