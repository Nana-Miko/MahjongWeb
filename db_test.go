package main

import (
	"MahjongWeb/sqlite"
	"fmt"
	"testing"
	"time"
)

func TestUser(t *testing.T) {
	user := sqlite.User{
		UserQQ: "1121917292",
		Name:   "3A",
	}
	err := user.Insert()
	if err != nil {
		fmt.Println(err)
	}
}

func TestRule(t *testing.T) {
	rule := sqlite.Rule{
		RuleName: "拔北三麻-日麻",
		Number:   3,
	}
	_, err := rule.Insert()
	if err != nil {
		fmt.Println(err)
	}
}

func TestGameInfo(t *testing.T) {
	gameinfo := sqlite.GameInfo{
		RulesID:        2,
		StartingPoints: 5000,
		EndTime:        time.Now(),
	}
	id, err := gameinfo.Insert()
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(id)
}

func TestExec(t *testing.T) {
	fmt.Println(sqlite.Exec("INSERT INTO user (qq,name) VALUES (?,?)", "123", "test"))
}
