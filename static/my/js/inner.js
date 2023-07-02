const loading_div = '<div class="spinner-border"></div>'

const null_div = '<div class="empty">\n' +
    '  <div class="empty-icon">\n' +
    '    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\n' +
    '      <path stroke="none" d="M0 0h24v24H0z" fill="none" />\n' +
    '      <circle cx="12" cy="12" r="9" />\n' +
    '      <line x1="9" y1="10" x2="9.01" y2="10" />\n' +
    '      <line x1="15" y1="10" x2="15.01" y2="10" />\n' +
    '      <path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" />\n' +
    '    </svg>\n' +
    '  </div>\n' +
    '  <p class="empty-title">未找到结果</p>\n' +
    '  <p class="empty-subtitle text-muted">\n' +
    '    尝试添加记录或重试\n' +
    '  </p>\n' +
    '</div>\n'

let game_ltb;
let user_ltb;

function all_inner(){
    timeLineUL = document.getElementById("time-line")
    lastGameTable = document.getElementById("last-game")
    time_line_inner()
    game_ltb=new LimitTables(document.getElementById('game-limit-table'),5,'btn btn-primary',last_game_inner)
    user_ltb=new LimitTables(document.getElementById('user-limit-table'),5,'btn btn-success',inner_user)
}

function time_line_inner(){
    timeLineUL.innerHTML = loading_div
    fetch('api/time_line')
        .then(response => response.json())
        .then(data=>{
            const time_lines = data.msg
            timeLineUL.innerHTML = ''
            const lis = document.createElement('div')
            const tForEach = time_lines.forEach(timeline=>{
                var daysDiffStr = "null"
                // 将时间戳字符串转换为 JavaScript 的 Date 对象
                var timestamp = new Date(timeline.time_line_time);
                // 获取当前时间的时间戳
                var now = new Date();
                // 计算时间差异（以毫秒为单位）
                var diff = now - timestamp;
                // 将时间差异转换为小时数
                var hoursDiff = Math.floor(diff / (1000 * 60 * 60));
                // 判断时间差异是否大于等于 24 小时
                if (hoursDiff >= 24) {
                    // 将时间差异转换为天数
                    var daysDiff = Math.floor(hoursDiff / 24);
                    daysDiffStr = daysDiff + "天前"
                } else {
                    daysDiffStr = hoursDiff + "小时前"
                }
                li = document.createElement("li")
                li.setAttribute("class","timeline-event")
                cDiv = document.createElement("div")
                cDiv.setAttribute("class","card timeline-event-card")
                cBDiv = document.createElement("div")
                cBDiv.setAttribute("class","card-body")
                cTDiv = document.createElement("div")
                cTDiv.setAttribute("class","text-muted float-end")
                cTDiv.textContent = daysDiffStr
                h = document.createElement("h4")
                h.textContent = timeline.time_line_title
                p = document.createElement("p")
                p.textContent = timeline.time_line_info

                cBDiv.appendChild(cTDiv)
                cBDiv.appendChild(h)
                cBDiv.appendChild(p)

                cDiv.appendChild(cBDiv)

                li.appendChild(cDiv)

                lis.appendChild(li)

            })
            Promise.all([tForEach]).then(()=>{
                console.log(lis.innerHTML)
                if (lis.innerHTML === ''){
                    timeLineUL.innerHTML = null_div
                }
                else {
                    timeLineUL.innerHTML = lis.innerHTML
                }
            })
        })



}






function last_game_inner(limit, offset){
    return  new Promise(function(resolve, reject) {
        lastGameTable.innerHTML = loading_div
        var formData = new FormData();
        formData.append('limit',limit)
        formData.append('offset',offset)
        fetch('api/game_limit',{
            method : 'POST',
            body:formData
        }).then(function(response) {
            return response.json();
        }).then(function(responseData){
            const game_infos = responseData.msg
            lastGameTable.innerHTML = `<thead>
                                        <tr>
                                            <th>对局ID</th>
                                            <th>对局规则</th>
                                            <th>初始点数</th>
                                            <th>结束时间</th>
                                            <th>一位雀士</th>
                                            <th></th>
                                        </tr>
                                        </thead>

                                        <tbody id="last-game-tbody">
                                            {tbs}
                                        </tbody>`
            const tbs = document.createElement('div')
            const gForEach = game_infos.forEach(game_info=>{
                const tr = document.createElement('tr')
                const th1 = document.createElement('th')
                th1.textContent = game_info.game_id
                const th2 = document.createElement('th')
                th2.textContent = game_info.rule.rule_name
                const th3 = document.createElement('th')
                th3.textContent = game_info.starting_points
                const th4 = document.createElement('th')
                th4.textContent = new Date(game_info.end_time).toLocaleString(undefined,{timeZone:'UTC'})
                const th5 = document.createElement('th')
                th5.textContent = game_info.winner
                const th6 = document.createElement('th')
                const a = document.createElement('a')
                a.href = '/game?game_id='+game_info.game_id
                a.setAttribute("class","btn btn-info")
                a.textContent = "详情"

                th6.appendChild(a)

                tr.appendChild(th1)
                tr.appendChild(th2)
                tr.appendChild(th3)
                tr.appendChild(th4)
                tr.appendChild(th5)
                tr.appendChild(th6)

                tbs.appendChild(tr)

            })
            Promise.all([gForEach]).then(()=>{
                if (tbs.innerHTML===''){
                    lastGameTable.innerHTML = null_div
                }
                else {
                    lastGameTable.innerHTML = lastGameTable.innerHTML.replace("{tbs}",tbs.innerHTML)
                }
                resolve(game_infos.length); // 将game_infos数组的长度作为结果传递
            })
        }).catch(function (error) {
            reject(error)
        })
    });
}

function inner_user(limit,offset){
    return  new Promise(function(resolve, reject) {
        const formData2 = new FormData
        formData2.append('limit',limit)
        formData2.append('offset',offset)
        fetch('/api/user_limit',{
            method:'POST',
            body:formData2,
        }).then(function (response) {
            return response.json()
        }).then(data=>{
            const user_infos = data.msg

            const tbs = document.createElement('div')
            const gForEach = user_infos.forEach(user_info=>{
                const link = `<a class="btn btn-light" href="/user?user_qq={qq}">{name}</a>`

                const tr = document.createElement('tr')
                const th1 = document.createElement('th')
                th1.innerHTML = link.replace('{qq}',user_info.user_qq).replace('{name}',user_info.name)
                const th2 = document.createElement('th')
                th2.innerHTML = get_score_title_span(user_info.score_title)

                const th3 = document.createElement('th')
                const a = document.createElement('a')
                a.href = '/user?user_qq='+user_info.user_qq
                a.setAttribute("class","btn btn-info")
                a.textContent = "详情"

                th3.appendChild(a)

                tr.appendChild(th1)
                tr.appendChild(th2)
                //tr.appendChild(th3)

                tbs.appendChild(tr)

            });
            Promise.all([gForEach]).then(()=>{
                document.getElementById('user-ranking-tbody').innerHTML = tbs.innerHTML
                resolve(user_infos.length)
            })

        })
    })

}