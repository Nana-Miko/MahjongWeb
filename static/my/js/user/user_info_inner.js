

const u_urlParams = new URLSearchParams(window.location.search);
const USERID = u_urlParams.get('user_qq');
const formData1 = new FormData()
formData1.append('user-qq',USERID)
fetch('/api/user',{
    method:'PUT',
    body:formData1,
}).then(function (response) {
    return response.json();
}).then(function (data) {
    if (data.success===false){
        document.getElementById('response-page').innerHTML = `<div class="empty">
  <div class="empty-icon">
    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
      <path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" />
    </svg>
  </div>
  <p class="empty-title">未找到该雀士或该雀士无对局记录</p>
  <p class="empty-subtitle text-muted">
    尝试登记雀士或添加一场对局吧
  </p>
</div>
`
        return
    }
    const user_name_dom = document.getElementById('user-name')
    user_name_dom.innerHTML = data.msg.user.name
    document.getElementById('user-win-ratio').innerHTML = "胜率:"+(data.msg.user_record.wins/data.msg.user_record.matches * 100).toFixed(0) + "%"
    const user_score_title = document.getElementById('score-title')
    user_score_title.innerHTML=get_score_title_span(data.msg.user.score_title)

    document.getElementById('user-name-mini').innerHTML = data.msg.user.name
    document.getElementById('user-qq').innerHTML = data.msg.user.user_qq
    document.getElementById('matches').innerHTML = data.msg.user_record.matches
    document.getElementById('wins').innerHTML = data.msg.user_record.wins
    document.getElementById('last-game-time').innerHTML = new Date(data.msg.user_record.last_game_time).toLocaleDateString(undefined,{timeZone:'UTC'})
    document.getElementById('last-game-ranking').innerHTML = data.msg.user_game.ranking
    const last_game_score_offset_dom = document.getElementById('last-game-score-offset')
    if (data.msg.user_game.score_offset[0]==="+"){
        last_game_score_offset_dom.setAttribute('class','status status-green')
    }else{
        last_game_score_offset_dom.setAttribute('class','status status-red')
    }
    last_game_score_offset_dom.innerHTML = data.msg.user_game.score_offset
    document.getElementById('score').innerHTML = Math.floor(data.msg.user.score).toString()

    // 载入同桌雀士
    for (let i = 0; i < data.msg.friendly.length; i++) {
        var index = i+1
        document.getElementById('friendly-'+index).innerHTML = '<a href="/user?user_qq='+data.msg.friendly[i].user_qq+'" >'+data.msg.friendly[i].user_name+'</a>'
        document.getElementById('friendly-'+index+'-matches').innerHTML = "同桌场数："+data.msg.friendly[i].game_count
        document.getElementById('friendly-'+index+'-ratios').innerHTML = "TA与你同桌时的胜率："+(data.msg.friendly[i].wins/data.msg.friendly[i].game_count * 100).toFixed(0) + "%"
        window.ApexCharts && (new ApexCharts(document.getElementById('chart-friendly-'+index+'-pie'), {
            chart: {
                type: "donut",
                fontFamily: 'inherit',
                height: 240,
                sparkline: {
                    enabled: true
                },
                animations: {
                    enabled: false
                },
            },
            fill: {
                opacity: 1,
            },
            series: [data.msg.friendly[i].wins,data.msg.friendly[i].lose,data.msg.friendly[i].draw],
            labels: ['TA与你同桌时的胜场','TA与你同桌时的败场','TA与你同桌时的平场'],
            tooltip: {
                theme: 'dark'
            },
            grid: {
                strokeDashArray: 4,
            },
            colors: [tabler.getColor("green"),tabler.getColor("red"),tabler.getColor("black")],
            legend: {
                show: true,
                position: 'bottom',
                offsetY: 12,
                markers: {
                    width: 10,
                    height: 10,
                    radius: 100,
                },
                itemMargin: {
                    horizontal: 8,
                    vertical: 8
                },
            },
            tooltip: {
                fillSeriesColor: false
            },
        })).render();
    }

    // 载入最近顺位
    rankings = []
    rule_names = []
    for (let i = 0; i < data.msg.last_rankings.length; i++) {
        rankings.push(-data.msg.last_rankings[i].ranking)
        rule_names.push(data.msg.last_rankings[i].name)
    }
    window.ApexCharts && (new ApexCharts(document.getElementById('chart-ranking-line'), {
        chart: {
            type: "line",
            fontFamily: 'inherit',
            height: 240,
            parentHeightOffset: 0,
            toolbar: {
                show: false,
            },
            animations: {
                enabled: false
            },
        },
        fill: {
            opacity: 1,
        },
        stroke: {
            width: 2,
            lineCap: "round",
            curve: "straight",
        },
        series: [{
            name: "顺位",
            data: rankings
        },],
        tooltip: {
            theme: 'dark'
        },
        grid: {
            padding: {
                top: -20,
                right: 0,
                left: -4,
                bottom: -4
            },
            strokeDashArray: 4,
        },
        xaxis: {
            title: {
                text: '规则',
                offsetY:-10,
                style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    cssClass: 'apexcharts-xaxis-title'
                }
            },
            labels: {
                padding: 0,
            },
            tooltip: {
                enabled: false
            },
            type: 'text',
        },
        yaxis: {
            tickAmount: rankings.length, // 设置刻度数量与提供的值的数量相同
            labels: {
                padding: 4,
                formatter: function (value) {
                    var absValue = Math.abs(value); // 获取绝对值
                    var roundedValue = Math.round(absValue); // 四舍五入取整
                    var suffix = absValue === roundedValue ? '位' : '位以上'; // 判断是否为整数位
                    return roundedValue + suffix; // 返回格式化后的标签
                }
            },
        },
        labels: rule_names,
        colors: [tabler.getColor("yellow"), tabler.getColor("green"), tabler.getColor("primary")],
        legend: {
            show: true,
            position: 'bottom',
            offsetY: 12,
            markers: {
                width: 10,
                height: 10,
                radius: 100,
            },
            itemMargin: {
                horizontal: 8,
                vertical: 8
            },
        },
    })).render();

    // 载入大牌记录
    new LimitTables(document.getElementById('yakuman-div'),5,'btn btn-warning',inner_yakuman)
    // 载入最近对局
    new LimitTables(document.getElementById('last-game-div'),5,'btn btn-primary',inner_last_game_user)
})

function inner_last_game_user(limit,offset){
    return  new Promise(function(resolve, reject) {
        const formData2 = new FormData
        formData2.append('user-qq',USERID)
        formData2.append('limit',limit)
        formData2.append('offset',offset)
        fetch('/api/game_limit',{
            method:'POST',
            body:formData2,
        }).then(function (response) {
            return response.json()
        }).then(data=>{
            const game_infos = data.msg

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

            });
            Promise.all([gForEach]).then(()=>{
                document.getElementById('last-game-tbody').innerHTML = tbs.innerHTML
                resolve(game_infos.length)
            })

        })
    })

}

function inner_yakuman(limit,offset){
    return  new Promise(function(resolve, reject) {
        const formData = new FormData
        formData.append('user-qq',USERID)
        formData.append('limit',limit)
        formData.append('offset',offset)
        fetch('/api/ya_ku_man_limit',{
            method:'POST',
            body:formData,
        }).then(function (response) {
            return response.json()
        }).then(data=>{

            const yaku_infos = data.msg

            const tbs = document.createElement('div')
            const yForEach = yaku_infos.forEach(yaku_info=>{
                const tr = document.createElement('tr')
                const th1 = document.createElement('th')
                th1.textContent = yaku_info.ya_ku
                const th2 = document.createElement('th')
                th2.textContent = yaku_info.count

                tr.appendChild(th1)
                tr.appendChild(th2)


                tbs.appendChild(tr)

            });
            Promise.all([yForEach]).then(()=>{
                document.getElementById('yakuman-tbody').innerHTML = tbs.innerHTML
                resolve(yaku_infos.length)
            })

        })
    })

}
