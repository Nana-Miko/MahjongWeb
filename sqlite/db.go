package sqlite

import (
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"time"
)

var sqlitePath string = "sqlite/mahjong.sqlite"

type User struct {
	UserQQ     string  `json:"user_qq" form:"user-qq"`
	Name       string  `json:"name" form:"user-name"`
	Score      float64 `json:"score" form:"user-score"`
	ScoreTitle string  `json:"score_title" form:"score-title"`
}

type Rule struct {
	RuleID   int    `json:"rule_id" form:"rule-id"`
	RuleName string `json:"rule_name" form:"rule-name"`
	Number   int    `json:"number" form:"number"`
}

type GameInfo struct {
	GameID         int       `json:"game_id" form:"game-id"`
	RulesID        int       `json:"game_rules" form:"rule-id"`
	StartingPoints int       `json:"starting_points" form:"starting-points"`
	EndTime        time.Time `json:"end_time" form:"end-time"`
	Note           string    `json:"note" form:"note"`
	Winner         string    `json:"winner" form:"winner"`
	Rule           Rule      `json:"rule" form:"rule"`
	Img            []string  `json:"img" form:"img"`
}

type UserGame struct {
	UserName    string  `json:"user_name" form:"user-name"`
	UserQQ      string  `json:"user_qq" form:"user-qq"`
	GameID      int     `json:"game_id" form:"game-id"`
	FinalScore  int     `json:"final_score" form:"final-score"`
	Ranking     int     `json:"ranking" form:"ranking"`
	ScoreRatio  float64 `json:"score_ratio" form:"score-ratio"`
	ScoreOffset string  `json:"score_offset" form:"score-offset"`
}

type UserRecord struct {
	UserQQ       string    `json:"user_qq" form:"user-qq"`
	LastGameTime time.Time `json:"last_game_time" form:"last-game-time"`
	LastGameID   int       `json:"last_game_id" form:"last-game-iD"`
	Matches      int       `json:"matches" form:"matches"`
	Wins         int       `json:"wins" form:"wins"`
}

type TimeLine struct {
	TimeLineID    int       `json:"time_line_id" form:"time-line-id"`
	TimeLineInfo  string    `json:"time_line_info" form:"time-line-info"`
	TimeLineTime  time.Time `json:"time_line_time" form:"time-line-time"`
	TimeLineTitle string    `json:"time_line_title" form:"time-line-title"`
}

type YaKuMan struct {
	UserQQ string `json:"user_qq" form:"user-qq"`
	GameID int    `json:"game_id" form:"game-id"`
	YaKu   string `json:"ya_ku" form:"ya-ku"`
	Count  int    `json:"count" form:"count"`
}

func openDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", sqlitePath)
	if err != nil {
		return nil, err
	}
	return db, nil
}

func OpenDB() (*sql.DB, error) {
	return openDB()
}

func NotFound() int {
	db, err := openDB()
	if err != nil {
		return -1
	}
	defer db.Close()
	var updatedCount int

	// 执行UPDATE语句
	_, err = db.Exec("UPDATE not_found SET count=count+1")
	if err != nil {
		return -1
	}

	// 查询更新后的值
	err = db.QueryRow("SELECT count FROM not_found").Scan(&updatedCount)
	if err != nil {
		return -1
	}

	return updatedCount
}

func Exec(query string, args ...any) (sql.Result, error) {
	db, err := openDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	result, err := db.Exec(query, args...)
	if err != nil {
		return nil, err
	}
	return result, err
}

func GetAllRule() ([]Rule, error) {
	db, err := openDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	res, err := db.Query("SELECT id,name,number FROM rule")
	if err != nil {
		return nil, err
	}
	defer res.Close()
	var rules []Rule
	for res.Next() {
		var rule Rule
		err := res.Scan(&rule.RuleID, &rule.RuleName, &rule.Number)
		if err != nil {
			return nil, err
		}
		rules = append(rules, rule)
	}
	return rules, nil
}

func GetAllUser() ([]User, error) {
	db, err := openDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	res, err := db.Query("SELECT qq,name,score FROM user")
	if err != nil {
		return nil, err
	}
	defer res.Close()
	var users []User
	for res.Next() {
		var user User
		err := res.Scan(&user.UserQQ, &user.Name, &user.Score)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func GetTimeLine(limit int) ([]TimeLine, error) {
	db, err := openDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	res, err := db.Query("SELECT id,info,time,title FROM time_line ORDER BY time DESC LIMIT ?", limit)
	if err != nil {
		return nil, err
	}
	defer res.Close()
	var timeLines = make([]TimeLine, 0)
	for res.Next() {
		var timeLine TimeLine
		err := res.Scan(&timeLine.TimeLineID, &timeLine.TimeLineInfo, &timeLine.TimeLineTime, &timeLine.TimeLineTitle)
		if err != nil {
			return nil, err
		}
		timeLines = append(timeLines, timeLine)
	}
	return timeLines, nil
}

func GetUserInfo(limit int, offset int) ([]User, error) {
	db, err := openDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	res, err := db.Query("SELECT * FROM user ORDER BY score DESC LIMIT ? OFFSET ?", limit, offset)
	if err != nil {
		return nil, err
	}
	defer res.Close()
	var userInfos = make([]User, 0)
	for res.Next() {
		var user User
		err := res.Scan(&user.UserQQ, &user.Name, &user.Score, &user.ScoreTitle)
		if err != nil {
			return nil, err
		}
		userInfos = append(userInfos, user)
	}
	return userInfos, nil
}

func GetGameInfo(limit int, offset int, userQQ string) ([]GameInfo, error) {
	db, err := openDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	var res *sql.Rows
	var err1 error
	if userQQ == "" {
		res, err1 = db.Query(`SELECT g.game_id, g.rules_id, g.starting_points, g.end_time, g.note, g.winner, r.name
								FROM game_info AS g
								JOIN rule AS r ON g.rules_id = r.id
								ORDER BY g.end_time DESC
								LIMIT ? OFFSET ?;`, limit, offset)
	} else {
		res, err1 = db.Query(`SELECT g.game_id, g.rules_id, g.starting_points, g.end_time, g.note, g.winner, r.name
									FROM game_info AS g
											 JOIN rule AS r ON g.rules_id = r.id
											 JOIN user_game AS ug ON g.game_id = ug.game_id
									WHERE ug.user_qq = ?
									ORDER BY g.end_time DESC
									LIMIT ? OFFSET ?;
`, userQQ, limit, offset)
	}

	if err1 != nil {
		return nil, err
	}
	defer res.Close()
	var gameInfos = make([]GameInfo, 0)
	for res.Next() {
		var gameInfo GameInfo
		err := res.Scan(&gameInfo.GameID, &gameInfo.RulesID, &gameInfo.StartingPoints, &gameInfo.EndTime, &gameInfo.Note, &gameInfo.Winner, &gameInfo.Rule.RuleName)
		if err != nil {
			return nil, err
		}
		gameInfos = append(gameInfos, gameInfo)
	}
	return gameInfos, nil
}

func (user User) Insert() error {
	if user.UserQQ == "" || user.Name == "" {
		return fmt.Errorf("无法插入空数据")
	}
	db, err := openDB()
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec("INSERT INTO user (qq,name) VALUES (?,?)", user.UserQQ, user.Name)
	if err != nil {
		return err
	}
	userRecord := UserRecord{UserQQ: user.UserQQ}
	_, err = db.Exec("INSERT INTO user_record (user_qq,last_game_time,last_game_id,matches,wins) VALUES (?,?,?,?,?)", userRecord.UserQQ, userRecord.LastGameTime, userRecord.LastGameID, userRecord.Matches, userRecord.Wins)
	return err
}

func (rule Rule) Insert() (int64, error) {
	if rule.RuleName == "" {
		return -1, errors.New("规则名称不能为空")
	}
	if rule.Number <= 0 {
		return -1, errors.New("人数不能小于等于0")
	}
	db, err := openDB()
	if err != nil {
		return -1, err
	}
	defer db.Close()
	res, err := db.Exec("INSERT INTO rule (name,number) VALUES (?,?)", rule.RuleName, rule.Number)
	if err != nil {
		return -1, err
	}
	num, err := res.LastInsertId()
	return num, err
}

func (gameInfo GameInfo) Insert() (int64, error) {
	db, err := openDB()
	if err != nil {
		return -1, err
	}
	defer db.Close()
	res, err := db.Exec("INSERT INTO game_info (rules_id,starting_points,end_time,note,winner) VALUES (?,?,?,?,?)", gameInfo.RulesID, gameInfo.StartingPoints, gameInfo.EndTime, gameInfo.Note, gameInfo.Winner)
	if err != nil {
		return -1, err
	}
	id, err := res.LastInsertId()
	return id, err
}

func (gameInfo GameInfo) InsertT(tx *sql.Tx) (int64, error) {
	res, err := tx.Exec("INSERT INTO game_info (rules_id,starting_points,end_time,note,winner) VALUES (?,?,?,?,?)", gameInfo.RulesID, gameInfo.StartingPoints, gameInfo.EndTime, gameInfo.Note, gameInfo.Winner)
	if err != nil {
		return -1, err
	}
	id, err := res.LastInsertId()
	return id, err

}

func (userGame UserGame) Insert() error {
	db, err := openDB()
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec("INSERT INTO user_game (user_qq,game_id,final_score,ranking,score_ratio) VALUES (?,?,?,?,?)", userGame.UserQQ, userGame.GameID, userGame.FinalScore, userGame.Ranking, userGame.ScoreRatio)
	return err
}

func (timeLine TimeLine) Insert() error {
	db, err := openDB()
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec("INSERT INTO time_line(info,time,title) VALUES (?,?,?)", timeLine.TimeLineInfo, timeLine.TimeLineTime, timeLine.TimeLineTitle)
	return err
}

func (yaKuMan YaKuMan) Insert() error {
	db, err := openDB()
	if err != nil {
		return err
	}
	defer db.Close()
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	for i := 0; i < yaKuMan.Count; i++ {
		_, err := tx.Exec("INSERT INTO ya_ku_man(user_qq,game_id,ya_ku) VALUES (?,?,?)", yaKuMan.UserQQ, yaKuMan.GameID, yaKuMan.YaKu)
		if err != nil {
			err := tx.Rollback()
			if err != nil {
				return err
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	return err
}
