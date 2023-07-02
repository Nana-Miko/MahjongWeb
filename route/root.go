package route

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"strconv"
)

func SearchGameInfo(context *gin.Context) {
	response := GetDefaultResponse()
	defer HtmlResponseDefer(&response, context, "game.html")

	gameId, err := strconv.Atoi(context.DefaultQuery("game_id", "null"))
	if response.ErrorCheck(err, context) {
		return
	}
	fmt.Println(gameId)
}
