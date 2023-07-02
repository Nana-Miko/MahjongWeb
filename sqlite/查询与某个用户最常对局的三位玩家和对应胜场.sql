SELECT
    user_qq,
    COUNT(DISTINCT game_id) AS game_count,
    COUNT(CASE WHEN score_ratio < 1 THEN 1 END) AS wins
FROM
    user_game
WHERE
        user_qq <> 1121917292
  AND game_id IN (
    SELECT game_id
    FROM user_game
    WHERE user_qq = 1121917292
)
GROUP BY
    user_qq
ORDER BY
    wins DESC
LIMIT 3;
