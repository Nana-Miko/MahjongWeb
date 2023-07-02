package route

import (
	"MahjongWeb/sqlite"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

// Response API响应
type Response struct {
	Code          int    `json:"-"`
	Success       bool   `json:"success"`
	Msg           any    `json:"msg"`
	ErrorPostForm string `json:"error_post_form"`
	timeLine      sqlite.TimeLine
	Text          string
}

// ResponseDefer API响应Defer
func ResponseDefer(response *Response, context *gin.Context) {
	if response.Success {
		if response.timeLine.TimeLineTitle != "" || response.timeLine.TimeLineInfo != "" {
			response.timeLine.TimeLineTime = time.Now()
			response.timeLine.Insert()
		}
	}
	context.JSON(response.Code, response)
}

// TextResponseDefer 文本响应Defer
func TextResponseDefer(response *Response, context *gin.Context) {
	if response.Success {
		if response.timeLine.TimeLineTitle != "" || response.timeLine.TimeLineInfo != "" {
			response.timeLine.TimeLineTime = time.Now()
			response.timeLine.Insert()
		}
	}
	context.String(response.Code, response.Text)
}

// HtmlResponseDefer Html响应Defer
func HtmlResponseDefer(response *Response, context *gin.Context, html string) {
	context.HTML(http.StatusOK, html, response)
}

// GetDefaultResponse 获取默认Response
func GetDefaultResponse() Response {
	return Response{
		Code:          http.StatusOK,
		Success:       true,
		Msg:           nil,
		ErrorPostForm: "",
	}
}

// ErrorCheck Response错误检查
func (response *Response) ErrorCheck(err error, context *gin.Context) bool {
	if err != nil {
		response.Error(err, context)
		return true
	}
	return false
}

// Error Response错误响应
func (response *Response) Error(err error, context *gin.Context) {
	response.Success = false
	response.Msg = err.Error()
	context.PostForm("e")
	formData := context.Request.PostForm
	for key, values := range formData {
		for _, value := range values {
			response.ErrorPostForm += "<var>" + key + ": " + value + "</var>"
		}
	}
}

// Successful Response成功响应
func (response *Response) Successful(msg any) {
	response.Success = true
	response.Msg = msg
}

// TimeLineDefer 插入事件时间线(成功响应后才会添加)
func (response *Response) TimeLineDefer(title string, info string) {
	response.timeLine.TimeLineTitle = title
	response.timeLine.TimeLineInfo = info
}
