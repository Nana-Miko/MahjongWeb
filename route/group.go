package route

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func RouterGroup(ginServer *gin.Engine) {
	//404 NoFound
	ginServer.NoRoute(func(context *gin.Context) {
		context.HTML(http.StatusNotFound, "404.html", nil)
	})

	// 根路由组
	root := ginServer.Group("/")
	root.GET("/", func(context *gin.Context) {
		context.HTML(http.StatusOK, "index.html", gin.H{
			"msg": "ok",
		})
	})
	root.GET("/game", SearchGameInfo)
	root.GET("/user", func(context *gin.Context) {
		context.HTML(http.StatusOK, "user.html", nil)
	})

	// API路由组
	api := ginServer.Group("/api")
	api.POST("/user", AddUser)
	api.GET("/user", GetAllUser)
	api.POST("/rule", AddRule)
	api.GET("/rule", GetAllRule)
	api.POST("/game", AddGameInfo)
	api.PUT("/game", GetGameInfoWithID)
	api.POST("/game_limit", GetGameInfo)
	api.POST("/user_limit", GetUserInfo)
	api.GET("/time_line", GetTimeLine)
	api.GET("/not_found", NotFound)
	api.POST("/upload_game_img", HandleUploadGameImage)
	api.PUT("/game_note", SetNote)
	api.PUT("/user", GetUserInfoWithID)

	api.POST("/ya_ku_man", AddYaKuMan)
	api.POST("/ya_ku_man_limit", GetYaKuWithUserID)
	api.PUT("/ya_ku_man", GetYaKuWithGameID)

}
