const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('game_id');
const userNameMap = new Map();
const userQQMap = new Map();
let ranking_name;
let ranking_colors;
const img_button=`<a class="carousel-control-prev" data-bs-target="#carousel-sample" role="button" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </a>
                        <a class="carousel-control-next" data-bs-target="#carousel-sample" role="button" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </a>`
function game_info_inner(){
    formData = new FormData()
    formData.append("game-id",gameId)
    game_info_fetch = fetch('/api/game',{
        method:'PUT',
        body:formData,
    }).then(function (response){
        return response.json();
    }).then(function (data) {
        if (data.success===false){
            // do fail
            return
        }
        const title_dom = document.getElementById('rule-name')
        title_dom.textContent = data.msg.game_info.rule.rule_name
        const title_point_dom = document.getElementById('starting-points')
        title_point_dom.textContent = "初始点数:"+data.msg.game_info.starting_points
        const title_time_dom = document.getElementById('end-time')
        title_time_dom.textContent = "结束时间:"+ new Date(data.msg.game_info.end_time).toLocaleString(undefined,{timeZone:'UTC'})

        const winner_cbs = document.getElementById('winner-cbs')
        const winner_cbs_default = winner_cbs.innerHTML
        const draw_cbs = document.getElementById('draw-cbs')
        const draw_cbs_default = draw_cbs.innerHTML
        const loser_cbs = document.getElementById('loser-cbs')
        const loser_cbs_default = loser_cbs.innerHTML
        ranking_name = []
        const ranking_final_score = []
        const ranking_score_offset = []
        const ranking_score_ratio = []

        userNameMap.clear()
        userQQMap.clear()
        const d_foreach = data.msg.user_games.forEach(user_game=>{
            userNameMap.set(user_game.user_name,user_game.user_qq)
            userQQMap.set(user_game.user_qq,user_game.user_name)
            if (user_game.score_ratio>1){
                if (winner_cbs.innerHTML===winner_cbs_default){winner_cbs.innerHTML = ''}
                const win_text_div = document.createElement('div')
                win_text_div.setAttribute('class',"text-center")
                const win_text_h = document.createElement('h3')
                win_text_h.innerHTML = '<a href="/user?user_qq='+user_game.user_qq+'">'+user_game.user_name+'</a>'
                win_text_div.appendChild(win_text_h)
                winner_cbs.appendChild(win_text_div)
            }
            else if (user_game.score_ratio<1){
                if (loser_cbs.innerHTML===loser_cbs_default){loser_cbs.innerHTML = ''}
                const lose_text_div = document.createElement('div')
                lose_text_div.setAttribute('class',"text-center")
                const lose_text_h = document.createElement('h3')
                lose_text_h.innerHTML = '<a href="/user?user_qq='+user_game.user_qq+'">'+user_game.user_name+'</a>'
                lose_text_div.appendChild(lose_text_h)
                loser_cbs.appendChild(lose_text_div)
            }
            else{
                if (draw_cbs.innerHTML===draw_cbs_default){draw_cbs.innerHTML = ''}
                const draw_text_div = document.createElement('div')
                draw_text_div.setAttribute('class',"text-center")
                const draw_text_h = document.createElement('h3')
                draw_text_h.innerHTML = '<a href="/user?user_qq='+user_game.user_qq+'">'+user_game.user_name+'</a>'
                draw_text_div.appendChild(draw_text_h)
                draw_cbs.appendChild(draw_text_div)
            }
            ranking_name.push(user_game.user_name)
            ranking_colors = [tabler.getColor("red"), tabler.getColor("orange"), tabler.getColor("purple"), tabler.getColor("green"),tabler.getColor("blue"),tabler.getColor("pink"),tabler.getColor("teal")]
            ranking_final_score.push(user_game.final_score)
            ranking_score_offset.push(user_game.score_offset)
            ranking_score_ratio.push(user_game.score_ratio)
        })
        Promise.all([d_foreach]).then(()=>{
            document.getElementById('chart-score-pie').innerHTML = ''
            window.ApexCharts && (new ApexCharts(document.getElementById('chart-score-pie'), {
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
                series: ranking_final_score,
                labels: ranking_name,
                tooltip: {
                    theme: 'dark'
                },
                grid: {
                    strokeDashArray: 4,
                },
                colors: ranking_colors,
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
            const ranking_tbody = document.getElementById('ranking-tbody')
            ranking_tbody.innerHTML = ''
            for (let i = 0; i < ranking_name.length; i++) {
                const th = document.createElement('th')
                th.setAttribute('scope',"row")
                th.textContent = (i+1).toString()
                const td1 = document.createElement('td')
                td1.textContent = ranking_name[i]
                const td2 = document.createElement('td')
                td2.textContent = ranking_final_score[i]
                const td3 = document.createElement('td')
                td3.textContent = ranking_score_offset[i]
                const tr = document.createElement('tr')

                if (ranking_score_ratio[i]>1){
                    tr.setAttribute('class','table-success')
                }
                else if (ranking_score_ratio[i]<1){
                    tr.setAttribute('class','table-danger')
                }
                else {
                    tr.setAttribute('class','table-dark')
                }
                tr.appendChild(th)
                tr.appendChild(td1)
                tr.appendChild(td2)
                tr.appendChild(td3)

                ranking_tbody.appendChild(tr)

            }


            //加载大牌
            inner_yakuman()

            // 加载大牌添加
            const yakuman_user_select_dom = document.getElementById("yakuman-user-select")
            yakuman_user_select_dom.innerHTML = ''
            for (const [key, value] of userNameMap) {
                const option_dom = document.createElement('option')
                option_dom.textContent = key
                option_dom.value = value
                yakuman_user_select_dom.appendChild(option_dom)
            }


            // 加载图片
            const img_dom = document.getElementById("img")
            const c_div = document.createElement('div')
            c_div.id = 'carousel-sample'
            c_div.setAttribute('class','carousel slide')
            c_div.setAttribute('data-bs-ride','carousel')

            const ci_div = document.createElement('div')
            ci_div.setAttribute('class','carousel-inner')

            let count = 0
            data.msg.game_info.img.forEach(img_path=>{
                const img_div = document.createElement('div')
                if (count === 0){
                    img_dom.innerHTML = ''
                    img_div.setAttribute('class','carousel-item active')
                }
                else{
                    img_div.setAttribute('class','carousel-item')
                }
                const img_img = document.createElement('img')
                img_img.setAttribute('class','d-block w-100')
                img_img.alt = ''
                img_img.src = img_path
                img_div.appendChild(img_img)
                ci_div.appendChild(img_div)
                count++
            })
            if (img_dom.innerHTML===''){
                c_div.appendChild(ci_div)
                img_dom.appendChild(c_div)
                img_dom.innerHTML += img_button
            }


            document.getElementById("dropzone-img").setAttribute('action',"/api/upload_game_img?game_id="+gameId)

            try{new Dropzone("#dropzone-img")}catch (error){}

            note_dom = document.getElementById("note")
            if (data.msg.game_info.note!==""){
                note_dom.innerHTML = ''
                note_dom.textContent = data.msg.game_info.note
            }

        })

    })
}

function inner_yakuman(){
    //加载大牌
    const yakumanFormData = new FormData()
    yakumanFormData.append('game-id',gameId)
    fetch('/api/ya_ku_man',{
        method:'PUT',
        body:yakumanFormData,
    }).then(function (response) {
        return response.json()
    }).then(data=>{
        const yakumanNameSet = new Set()

        for (let i = 0; i < data.msg.length; i++) {
            yakumanNameSet.add(data.msg[i].ya_ku)
        }
        const yakumanNameArray = Array.from(yakumanNameSet)
        if (yakumanNameArray.length===0){
            // 无大牌处理
            return
        }

        const seriesArray = [];
        for (let i = 0; i < ranking_name.length; i++) {
            const obj = {
                data: Array(yakumanNameArray.length).fill(0),
                name:""
            };
            seriesArray.push(obj);
        }


        for (let i = 0; i < data.msg.length; i++) {
            var user_name = userQQMap.get(data.msg[i].user_qq)
            var user_name_index = ranking_name.indexOf(user_name)
            var yaku_name_index = yakumanNameArray.indexOf(data.msg[i].ya_ku)
            seriesArray[user_name_index].name = ranking_name[user_name_index]
            seriesArray[user_name_index].data[yaku_name_index] = data.msg[i].count
        }
        const yakuman_bar_dom = document.getElementById('chart-yakuman-bar')
        yakuman_bar_dom.innerHTML = ''
        window.ApexCharts && (new ApexCharts(yakuman_bar_dom, {
            chart: {
                type: "bar",
                fontFamily: 'inherit',
                height: 240,
                parentHeightOffset: 0,
                toolbar: {
                    show: false,
                },
                animations: {
                    enabled: false
                },
                stacked: true,
            },
            plotOptions: {
                bar: {
                    barHeight: '50%',
                    horizontal: true,
                }
            },
            dataLabels: {
                enabled: false,
            },
            fill: {
                opacity: 1,
            },
            series: seriesArray,
            tooltip: {
                theme: 'dark'
            },
            grid: {
                padding: {
                    top: -20,
                    right: 0,
                    left: 0,
                    bottom: -4
                },
                strokeDashArray: 4,
            },
            xaxis: {
                labels: {
                    padding: 0,
                    formatter: function (value) {
                        return Math.round(value); // 修改此处为Math.round(value)，将X轴数据显示为整数
                    }
                },
                tooltip: {
                    enabled: false
                },
                axisBorder: {
                    show: false,
                },
                categories: yakumanNameArray,

            },
            yaxis: {
                labels: {
                    padding: 4
                },
            },
            colors: ranking_colors,
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


    })
}

