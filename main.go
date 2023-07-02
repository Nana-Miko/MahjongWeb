package main

import (
	"MahjongWeb/route"
	"github.com/gin-gonic/gin"
	"github.com/thinkerou/favicon"
	"net/http"
	"sync"
)

func main() {

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		runHttpsServer("0.0.0.0:443", "conf/koreyoshi.club.crt", "conf/koreyoshi.club.key")
	}()

	go func() {
		defer wg.Done()
		runHttpServer("0.0.0.0:80")
	}()

	wg.Wait()

}

func runHttpsServer(host string, pem string, key string) {
	ginServer := gin.Default()
	ginServer.LoadHTMLGlob("templates/*")
	ginServer.Static("static", "./static")
	ginServer.Use(favicon.New("static/my/ico.ico"))

	route.RouterGroup(ginServer)
	ginServer.RunTLS(host, pem, key)
}

func runHttpServer(host string) {
	ginServer := gin.Default()
	ginServer.LoadHTMLGlob("httpTemplates/*")
	ginServer.Static("static/tabler", "./static/tabler")
	ginServer.Use(favicon.New("static/my/ico.ico"))
	ginServer.Use(redirectToHTTPS())

	ginServer.Run(host)

}

// redirectToHTTPS 设置http重定向到https
func redirectToHTTPS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.HTML(http.StatusOK, "redirect.html", nil)
		c.Abort()
	}
}
