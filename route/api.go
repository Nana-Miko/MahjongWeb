package route

import (
	"MahjongWeb/sqlite"
	"crypto/rand"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"image"
	"image/jpeg"
	"math/big"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

type keyValue struct {
	Key   string
	Value int64
}

// AddUser 添加用户API
func AddUser(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	user := sqlite.User{
		UserQQ: context.PostForm("user-qq"),
		Name:   context.PostForm("user-name"),
	}
	err := user.Insert()
	if response.ErrorCheck(err, context) {
		return
	}
	response.TimeLineDefer("新雀士登记！", "欢迎新雀士："+context.PostForm("user-name"))
}

// AddRule 添加麻将规则API
func AddRule(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	number, err := strconv.Atoi(context.PostForm("rule-number"))
	if response.ErrorCheck(err, context) {
		return
	}
	rule := sqlite.Rule{
		RuleName: context.PostForm("rule-name"),
		Number:   number,
	}
	num, err := rule.Insert()
	if response.ErrorCheck(err, context) {
		return
	}
	response.Successful(map[string]int64{"rule_id": num})
	response.TimeLineDefer("新规则添加！", "现在，我们有新的规则"+context.PostForm("rule-name")+"啦！它支持"+context.PostForm("rule-number")+"人游玩噢！")
}

func AddYaKuMan(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	gameID, err := strconv.Atoi(context.PostForm("game-id"))
	if response.ErrorCheck(err, context) {
		return
	}
	count, err := strconv.Atoi(context.PostForm("count"))
	if response.ErrorCheck(err, context) {
		return
	}
	yaKuMan := sqlite.YaKuMan{
		UserQQ: context.PostForm("user-qq"),
		GameID: gameID,
		YaKu:   context.PostForm("ya-ku"),
		Count:  count,
	}
	yaKuMan.Count = count
	err = yaKuMan.Insert()
	if response.ErrorCheck(err, context) {
		return
	}
}

func SetNote(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	gameID, err := strconv.Atoi(context.PostForm("game-id"))
	note := context.PostForm("note")
	if note == "" {
		response.Error(errors.New("备注不能为空！"), context)
		return
	}
	if response.ErrorCheck(err, context) {
		return
	}
	db, err := sqlite.OpenDB()
	if response.ErrorCheck(err, context) {
		return
	}
	defer db.Close()
	_, err = db.Exec("UPDATE game_info SET note=? WHERE game_id=?", note, gameID)
	if response.ErrorCheck(err, context) {
		return
	}

}

func printFormData(context *gin.Context) {
	context.PostForm("test-test")
	formData := context.Request.PostForm
	for key, values := range formData {
		for _, value := range values {
			println(key + ": " + value)
		}
	}
}

func GetGameInfoWithID(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	gameID, err := strconv.Atoi(context.PostForm("game-id"))
	if response.ErrorCheck(err, context) {
		return
	}
	db, err := sqlite.OpenDB()
	if response.ErrorCheck(err, context) {
		return
	}
	defer db.Close()
	res1, err := db.Query(`SELECT game_info.*, rule.*
									FROM game_info
         							INNER JOIN rule ON rule.id = game_info.rules_id WHERE game_id=?;`, gameID)
	res2, err2 := db.Query(`SELECT user_game.*, user.name
								FROM user_game
         						INNER JOIN user ON user_game.user_qq = user.qq WHERE game_id=? ORDER BY ranking;`, gameID)
	if response.ErrorCheck(err, context) || response.ErrorCheck(err2, context) {
		return
	}
	defer res1.Close()
	defer res2.Close()
	var gameInfo sqlite.GameInfo
	res1.Next()
	err = res1.Scan(&gameInfo.GameID, &gameInfo.RulesID, &gameInfo.StartingPoints, &gameInfo.EndTime, &gameInfo.Note, &gameInfo.Winner, &gameInfo.Rule.RuleID, &gameInfo.Rule.RuleName, &gameInfo.Rule.Number)
	if response.ErrorCheck(err, context) || gameInfo.GameID == 0 {
		return
	}
	userGames := make([]sqlite.UserGame, 0)
	for res2.Next() {
		var userGame sqlite.UserGame
		err := res2.Scan(&userGame.UserQQ, &userGame.GameID, &userGame.FinalScore, &userGame.Ranking, &userGame.ScoreRatio, &userGame.ScoreOffset, &userGame.UserName)
		if response.ErrorCheck(err, context) {
			return
		}
		userGames = append(userGames, userGame)
	}

	imgPath := "./static/my/img/game_img/" + strconv.Itoa(gameID)
	imgPaths := make([]string, 0)
	filepath.Walk(imgPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			imgPaths = append(imgPaths, path)
		}

		return nil
	})
	gameInfo.Img = imgPaths
	response.Successful(map[string]any{"game_info": gameInfo, "user_games": userGames})

}

func GetUserInfoWithID(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	userQQ, err := strconv.Atoi(context.PostForm("user-qq"))
	if response.ErrorCheck(err, context) {
		return
	}
	db, err := sqlite.OpenDB()
	if response.ErrorCheck(err, context) {
		return
	}
	defer db.Close()
	// 查询用户记录
	res, err := db.Query(`SELECT *
								FROM user
								INNER JOIN user_record ON user.qq = user_record.user_qq
								INNER JOIN game_info ON user_record.last_game_id = game_info.game_id
								INNER JOIN user_game ON user_record.last_game_id = user_game.game_id AND user_record.user_qq = user_game.user_qq
								WHERE user.qq=?;
`, userQQ)
	if response.ErrorCheck(err, context) {
		return
	}
	defer res.Close()
	res.Next()
	var user sqlite.User
	var userRecord sqlite.UserRecord
	var gameInfo sqlite.GameInfo
	var userGame sqlite.UserGame
	err = res.Scan(&user.UserQQ, &user.Name, &user.Score, &user.ScoreTitle, &userRecord.UserQQ, &userRecord.LastGameTime, &userRecord.LastGameID, &userRecord.Matches, &userRecord.Wins, &gameInfo.GameID, &gameInfo.RulesID, &gameInfo.StartingPoints, &gameInfo.EndTime, &gameInfo.Note, &gameInfo.Winner, &userGame.UserQQ, &userGame.GameID, &userGame.FinalScore, &userGame.Ranking, &userGame.ScoreRatio, &userGame.ScoreOffset)
	if response.ErrorCheck(err, context) {
		return
	}

	// 查询用户最近顺位
	res2, err := db.Query(`SELECT *
								FROM (
										 SELECT user_game.ranking,rule.name,game_info.end_time
										 FROM user_game
										 INNER JOIN game_info ON user_game.game_id = game_info.game_id
										 INNER JOIN rule ON game_info.rules_id = rule.id
										 WHERE user_game.user_qq = ?
										 ORDER BY game_info.end_time DESC
										 LIMIT 10
									 ) AS subquery
								ORDER BY subquery.end_time ASC;

`, userQQ)
	if response.ErrorCheck(err, context) {
		return
	}
	defer res2.Close()
	type rank struct {
		Ranking int       `json:"ranking"`
		Name    string    `json:"name"`
		EndTime time.Time `json:"end_time"`
	}

	var lastRankings = make([]rank, 0)
	for res2.Next() {
		var rankTemp rank
		err := res2.Scan(&rankTemp.Ranking, &rankTemp.Name, &rankTemp.EndTime)
		if response.ErrorCheck(err, context) {
			return
		}
		lastRankings = append(lastRankings, rankTemp)
	}

	// 查询用户与同桌最多用户
	res3, err := db.Query(`SELECT
									ug.user_qq,
									u.name,
									COUNT(DISTINCT ug.game_id) AS game_count,
									COUNT(CASE WHEN ug.score_ratio > 1 THEN 1 END) AS wins,
									COUNT(CASE WHEN ug.score_ratio < 1 THEN 1 END) AS lose,
									COUNT(CASE WHEN ug.score_ratio = 1 THEN 1 END) AS draw
								FROM
									user_game AS ug
										INNER JOIN user AS u ON u.qq = ug.user_qq
								WHERE
										ug.user_qq <> ?
								  AND ug.game_id IN (
									SELECT game_id
									FROM user_game
									WHERE user_qq = ?
								)
								GROUP BY
									ug.user_qq,
									u.name
								ORDER BY
									game_count DESC
								LIMIT 3;
`, userQQ, userQQ)
	if response.ErrorCheck(err, context) {
		return
	}
	defer res3.Close()
	type friendly struct {
		UserQQ    string `json:"user_qq"`
		UserName  string `json:"user_name"`
		GameCount int    `json:"game_count"`
		Wins      int    `json:"wins"`
		Lose      int    `json:"lose"`
		Draw      int    `json:"draw"`
	}
	var friendlys = make([]friendly, 0)
	for res3.Next() {
		var tempFriendly friendly
		err := res3.Scan(&tempFriendly.UserQQ, &tempFriendly.UserName, &tempFriendly.GameCount, &tempFriendly.Wins, &tempFriendly.Lose, &tempFriendly.Draw)
		if response.ErrorCheck(err, context) {
			return
		}
		friendlys = append(friendlys, tempFriendly)
	}
	response.Successful(map[string]any{
		"user":          user,
		"user_record":   userRecord,
		"user_game":     userGame,
		"game_info":     gameInfo,
		"last_rankings": lastRankings,
		"friendly":      friendlys,
	})

}

func GetYaKuWithGameID(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	gameID, err := strconv.Atoi(context.PostForm("game-id"))
	if response.ErrorCheck(err, context) {
		return
	}
	db, err := sqlite.OpenDB()
	if response.ErrorCheck(err, context) {
		return
	}
	defer db.Close()
	res, err := db.Query(`SELECT *, COUNT(*) AS count
								FROM ya_ku_man
								WHERE game_id = ?
								GROUP BY game_id,user_qq,ya_ku 
`, gameID)
	if response.ErrorCheck(err, context) {
		return
	}
	yaKuMans := make([]sqlite.YaKuMan, 0)
	for res.Next() {
		var yaKuMan sqlite.YaKuMan
		err := res.Scan(&yaKuMan.UserQQ, &yaKuMan.GameID, &yaKuMan.YaKu, &yaKuMan.Count)
		if response.ErrorCheck(err, context) {
			return
		}
		yaKuMans = append(yaKuMans, yaKuMan)
	}
	response.Successful(yaKuMans)

}
func GetYaKuWithUserID(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	userQQ := context.PostForm("user-qq")
	limit, err := strconv.Atoi(context.PostForm("limit"))
	if limit > 20 {
		response.Error(errors.New("一次性查询不能超过20条！"), context)
		return
	}
	if response.ErrorCheck(err, context) {
		return
	}
	offset, err := strconv.Atoi(context.PostForm("offset"))
	if response.ErrorCheck(err, context) {
		return
	}
	db, err := sqlite.OpenDB()
	if response.ErrorCheck(err, context) {
		return
	}
	defer db.Close()
	res, err := db.Query(`SELECT *, COUNT(*) AS count
								FROM ya_ku_man
								WHERE user_qq = ?
								GROUP BY ya_ku 
								ORDER BY count DESC
								LIMIT ? OFFSET ?
`, userQQ, limit, offset)
	if response.ErrorCheck(err, context) {
		return
	}
	yaKuMans := make([]sqlite.YaKuMan, 0)
	for res.Next() {
		var yaKuMan sqlite.YaKuMan
		err := res.Scan(&yaKuMan.UserQQ, &yaKuMan.GameID, &yaKuMan.YaKu, &yaKuMan.Count)
		if response.ErrorCheck(err, context) {
			return
		}
		yaKuMans = append(yaKuMans, yaKuMan)
	}
	response.Successful(yaKuMans)
}

// TODO 添加对局API
func AddGameInfo(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	ruleID, err := strconv.Atoi(context.PostForm("rule-id"))
	if response.ErrorCheck(err, context) {
		return
	}
	startingPoints, err := strconv.Atoi(context.PostForm("starting-points"))
	if response.ErrorCheck(err, context) {
		return
	}
	endTime, err := time.Parse("2006-01-02T15:04", context.PostForm("end-time"))
	if response.ErrorCheck(err, context) {
		return
	}
	note := context.PostForm("note")

	gameInfo := sqlite.GameInfo{
		RulesID:        ruleID,
		StartingPoints: startingPoints,
		EndTime:        endTime,
		Note:           note,
		Winner:         "temp",
	}

	db, err := sqlite.OpenDB()
	if response.ErrorCheck(err, context) {
		return
	}
	defer db.Close()
	tx, err := db.Begin()
	if response.ErrorCheck(err, context) {
		return
	}

	gameID, err := gameInfo.InsertT(tx)
	if response.ErrorCheck(err, context) {
		tx.Rollback()
		return
	}

	number, err := strconv.Atoi(context.PostForm("number"))
	if response.ErrorCheck(err, context) {
		tx.Rollback()
		return
	}

	scoreMap := map[string]int64{}
	for i := 1; i < number+1; i++ {
		userQQFormString := "user-qq-" + strconv.Itoa(i)
		userScoreFormString := "user-score-" + strconv.Itoa(i)
		score, err := strconv.Atoi(context.PostForm(userScoreFormString))
		if response.ErrorCheck(err, context) {
			return
		}
		//if score < 0 {
		//	response.Error(fmt.Errorf("添加失败，怎么有人分数为负数的？"), context)
		//	tx.Rollback()
		//	return
		//}
		scoreMap[context.PostForm(userQQFormString)] = int64(score)
	}

	kvSlice := make([]keyValue, 0, len(scoreMap))
	for key, value := range scoreMap {
		if key == "null" {
			response.Error(fmt.Errorf("添加失败，雀士未登记"), context)
			tx.Rollback()
			return
		}
		kvSlice = append(kvSlice, keyValue{Key: key, Value: value})
	}
	sort.Slice(kvSlice, func(i, j int) bool {
		return kvSlice[i].Value > kvSlice[j].Value
	})

	for i, kv := range kvSlice {
		ranking := i + 1
		userQQ := kv.Key
		userScore := kv.Value
		scoreRatio := float64(userScore) / float64(startingPoints)
		if scoreRatio < 0 {
			scoreRatio = 0
		}
		if ranking == 1 {
			var winnerName string
			err := tx.QueryRow("SELECT name FROM user WHERE qq = ?", userQQ).Scan(&winnerName)
			if response.ErrorCheck(err, context) {
				tx.Rollback()
				return
			}
			err = tx.QueryRow("SELECT name FROM rule WHERE id = ?", gameInfo.RulesID).Scan(&gameInfo.Rule.RuleName)
			if response.ErrorCheck(err, context) {
				tx.Rollback()
				return
			}
			gameInfo.Winner = winnerName
			_, err = tx.Exec("UPDATE game_info SET winner = ? WHERE game_id = ?", winnerName, gameID)
			if response.ErrorCheck(err, context) {
				tx.Rollback()
				return
			}
		}
		_, err = tx.Exec("INSERT INTO user_game (user_qq, game_id, final_score, ranking, score_ratio) VALUES (?,?,?,?,?)",
			userQQ, gameID, userScore, ranking, scoreRatio)
		if err != nil {
			rbErr := tx.Rollback()
			if response.ErrorCheck(rbErr, context) {
				return
			}
			response.Error(err, context)
			return
		}
		var errs error
		if scoreRatio > 1 {
			_, errs = tx.Exec("UPDATE user_record SET wins=wins+1,matches=matches+1,last_game_time=?,last_game_id=? WHERE user_qq=?",
				endTime, gameID, userQQ)
		} else {
			_, errs = tx.Exec("UPDATE user_record SET matches=matches+1,last_game_time=?,last_game_id=? WHERE user_qq=?",
				endTime, gameID, userQQ)
		}
		if errs != nil {
			rbErr := tx.Rollback()
			if response.ErrorCheck(rbErr, context) {
				return
			}
			response.Error(errs, context)
			return
		}
		offset := scoreRatio - 1
		// 分数基准值
		var base float64 = 5000
		scoreOffset := base * offset * 0.1
		var scoreOffsetStr string
		if scoreOffset >= 0 {
			scoreOffsetStr = "+" + strconv.FormatFloat(scoreOffset, 'f', 3, 64)
		} else {
			scoreOffsetStr = strconv.FormatFloat(scoreOffset, 'f', 3, 64)
		}
		_, err = tx.Exec("UPDATE user SET score=score+? WHERE qq=?", scoreOffset, userQQ)
		_, err2 := tx.Exec("UPDATE user_game SET score_offset=? WHERE user_qq=? AND game_id=?", scoreOffsetStr, userQQ, gameID)
		if err != nil || err2 != nil {
			rbErr := tx.Rollback()
			if response.ErrorCheck(rbErr, context) {
				return
			}
			response.Error(err, context)
			return
		}
	}

	if response.ErrorCheck(tx.Commit(), context) {
		return
	}

	response.TimeLineDefer("有新的对局添加了！", "由"+gameInfo.Winner+"赢得了本场"+gameInfo.Rule.RuleName+"对局！")

}

func GetAllUser(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	users, err := sqlite.GetAllUser()
	if response.ErrorCheck(err, context) {
		return
	}
	response.Successful(users)
}
func GetAllRule(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	rules, err := sqlite.GetAllRule()
	if response.ErrorCheck(err, context) {
		return
	}
	response.Successful(rules)
}

func GetTimeLine(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	timeLines, err := sqlite.GetTimeLine(5)
	if response.ErrorCheck(err, context) {
		return
	}
	response.Successful(timeLines)
}

func GetGameInfo(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	userQQ := context.PostForm("user-qq")
	limit, err := strconv.Atoi(context.PostForm("limit"))
	if limit > 20 {
		response.Error(errors.New("一次性查询不能超过20条！"), context)
		return
	}
	if response.ErrorCheck(err, context) {
		return
	}
	offset, err := strconv.Atoi(context.PostForm("offset"))
	if response.ErrorCheck(err, context) {
		return
	}
	gameInfos, err := sqlite.GetGameInfo(limit, offset, userQQ)
	if response.ErrorCheck(err, context) {
		return
	}
	response.Successful(gameInfos)
}

func GetUserInfo(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	limit, err := strconv.Atoi(context.PostForm("limit"))
	if limit > 20 {
		response.Error(errors.New("一次性查询不能超过20条！"), context)
		return
	}
	if response.ErrorCheck(err, context) {
		return
	}
	offset, err := strconv.Atoi(context.PostForm("offset"))
	if response.ErrorCheck(err, context) {
		return
	}
	userInfos, err := sqlite.GetUserInfo(limit, offset)
	if response.ErrorCheck(err, context) {
		return
	}
	response.Successful(userInfos)
}

func NotFound(context *gin.Context) {
	response := GetDefaultResponse()
	defer ResponseDefer(&response, context)
	response.Successful(sqlite.NotFound())
}

func HandleUploadGameImage(context *gin.Context) {
	response := GetDefaultResponse()
	defer TextResponseDefer(&response, context)
	file, err := context.FormFile("file")
	if response.ErrorCheck(err, context) {
		response.Code = http.StatusBadRequest
		response.Text = err.Error()
		return
	}
	if file.Size > 10*1024*1024 { // 10MB
		response.Code = http.StatusBadRequest
		response.Text = "文件大小超过10M"
		return
	}
	// 验证文件类型
	if !isImage(file) {
		response.Code = http.StatusBadRequest
		response.Text = "文件格式不正确，支持的类型:" + "jpg,jpeg,png,gif"
		return
	}
	// 创建保存目录
	gameID := context.Query("game_id")
	savePath := "./static/my/img/game_img/" + gameID
	err = os.MkdirAll(savePath, os.ModePerm)
	if err != nil || gameID == "" {
		response.Code = http.StatusInternalServerError
		response.Text = "无法创建保存目录"
		return
	}
	// 生成保存的文件名
	fileExt := filepath.Ext(file.Filename)
	saveFilename := generateSaveFilename(fileExt)
	// 压缩并保存文件
	saveFilePath := filepath.Join(savePath, saveFilename)
	err = compressAndSaveImage(file, saveFilePath)
	if err != nil {
		response.Code = http.StatusInternalServerError
		response.Text = "文件保存失败"
	}

	response.Text = "文件上传成功！"

}

// 验证文件类型是否为图片
func isImage(file *multipart.FileHeader) bool {
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif"}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	for _, allowedExt := range allowedExtensions {
		if ext == allowedExt {
			return true
		}
	}
	return false
}

// 生成保存的文件名，使用时间戳和随机字符串
func generateSaveFilename(ext string) string {
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	randomString, _ := generateRandomString(8) // 自行实现生成随机字符串的函数
	return fmt.Sprintf("%d_%s%s", timestamp, randomString, ext)
}

func generateRandomString(length int) (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	charsetLength := big.NewInt(int64(len(charset)))

	randomString := make([]byte, length)
	for i := 0; i < length; i++ {
		randomIndex, err := rand.Int(rand.Reader, charsetLength)
		if err != nil {
			return "", err
		}
		randomString[i] = charset[randomIndex.Int64()]
	}

	return string(randomString), nil
}

// 创建辅助函数，用于压缩并保存图片
func compressAndSaveImage(file *multipart.FileHeader, savePath string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// 将图片解码为图像对象
	img, _, err := image.Decode(src)
	if err != nil {
		return err
	}

	// 创建目标文件
	dst, err := os.Create(savePath)
	if err != nil {
		return err
	}
	defer dst.Close()

	// 将图像对象以JPEG格式保存到目标文件
	err = jpeg.Encode(dst, img, &jpeg.Options{Quality: 80})
	if err != nil {
		return err
	}

	return nil
}
