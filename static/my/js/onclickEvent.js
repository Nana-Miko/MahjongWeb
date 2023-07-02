const loading_modal = '<div class="modal-dialog" role="document">\n' +
    '                                    <div class="modal-content">\n' +
    '                                        <div class="modal-header">\n' +
    '                                            <h5 class="modal-title">{title}</h5>\n' +
    '                                        </div>\n' +
    '                                        <div class="modal-body">\n' +
    '                                            <div class="spinner-border"></div>\n' +
    '                                        </div>\n' +
    '                                    </div>\n' +
    '                                </div>'

const success_modal = '<div class="modal-dialog modal-sm" role="document">\n' +
    '    <div class="modal-content">\n' +
    '      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>\n' +
    '      <div class="modal-status bg-success"></div>\n' +
    '      <div class="modal-body text-center py-4">\n' +
    '        <svg xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-green icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\n' +
    '          <path stroke="none" d="M0 0h24v24H0z" fill="none" />\n' +
    '          <circle cx="12" cy="12" r="9" />\n' +
    '          <path d="M9 12l2 2l4 -4" />\n' +
    '        </svg>\n' +
    '        <h3>{title}</h3>\n' +
    '        <div class="text-muted">{msg}</div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>'

const fail_modal = '<div class="modal-dialog modal-sm" role="document">\n' +
    '    <div class="modal-content">\n' +
    '      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>\n' +
    '      <div class="modal-status bg-danger"></div>\n' +
    '      <div class="modal-body text-center py-4">\n' +
    '        <svg xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-danger icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\n' +
    '          <path stroke="none" d="M0 0h24v24H0z" fill="none" />\n' +
    '          <path d="M12 9v2m0 4v.01" />\n' +
    '          <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />\n' +
    '        </svg>\n' +
    '        <h3>{title}</h3>\n' +
    '        <div class="text-muted">{msg}</div>\n' +
    '      </div>\n' +
    '      <div id="error-info" class="modal-body text-center py-4">\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n'

function get_success_modal(title,msg){
    return success_modal.replace("{title}",title).replace("{msg}",msg)
}
function get_fail_modal(title,msg,errorInfo){
    var html = fail_modal.replace("{title}",title).replace("{msg}",msg);
    if (errorInfo==null){
        return html
    }
    // 将HTML字符串转换为DOM节点
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // 获取错误信息的div元素
    var errorInfoDiv = tempDiv.querySelector('#error-info');
    // 创建按钮元素
    var button = document.createElement('div');
    button.setAttribute('class', 'alert alert-danger');
    button.setAttribute('role', 'alert');
    button.textContent = errorInfo;
    // 将按钮添加到错误信息的div元素中
    errorInfoDiv.appendChild(button);
    // 获取修改后的HTML字符串
    var modifiedHtml = tempDiv.innerHTML;
    return modifiedHtml



}
function get_loading_modal(title){
    return loading_modal.replace("{title}",title)
}

function user_default(){
    var callbackModal = document.querySelector('#add-user-callback-modal');
    callbackModal.innerHTML = get_loading_modal("等待响应中...")
}

function rule_default(){
    var callbackModal = document.querySelector('#add-rule-callback-modal');
    callbackModal.innerHTML = get_loading_modal("等待响应中...")
}

function note_default(){
    var callbackModal = document.querySelector('#add-note-callback-modal');
    callbackModal.innerHTML = get_loading_modal("等待响应中...")
}

function yaku_default(){
    var callbackModal = document.querySelector('#add-yakuman-callback-modal');
    callbackModal.innerHTML = get_loading_modal("等待响应中...")
}

function game_default(){
    var callbackModal = document.querySelector('#add-game-callback-modal');
    callbackModal.innerHTML = get_loading_modal("等待响应中...")
    var modal = document.querySelector('#add-game-modal');
    init_add_game(modal)
}

let datalistUser = null
let datalistRule = null
let lastListUserStr = "{users}"
let lastListRuleStr = "{rules}"

function init_add_game(modal){
    const addGameModalHtml = modal.innerHTML
    modal.innerHTML = get_loading_modal("等待响应中...")
    datalistUser = document.createElement('datalist')
    datalistUser.id = 'users'
    datalistRule = document.createElement('datalist')
    datalistRule.id = 'rules'

    const fetchUser = fetch('api/user')
        .then(response => response.json())
        .then(data => {
            const users = data.msg;
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.name;
                option.setAttribute('user-qq',user.user_qq);
                datalistUser.appendChild(option);
            });
        })
        .catch(error => console.error(error));
    const fetchRule = fetch('api/rule')
        .then(response => response.json())
        .then(data => {
            const rules = data.msg;
            rules.forEach(rule => {
                const option = document.createElement('option');
                option.value = rule.rule_name;
                option.setAttribute('rule-id',rule.rule_id)
                option.setAttribute('rule-number',rule.number)
                datalistRule.appendChild(option)
            });

        })
        .catch(error => console.error(error));

    Promise.all([fetchUser, fetchRule])
        .then(() => {
            const rulesData = datalistRule.outerHTML;
            const usersData = datalistUser.outerHTML;

            modal.innerHTML = '';
            modal.innerHTML = addGameModalHtml.replace(lastListRuleStr, rulesData).replace(lastListUserStr, usersData);

            lastListRuleStr = rulesData;
            lastListUserStr = usersData;

            rule_check();
            user_check();

            // 获取当前时间
            var currentDate = new Date();

            // 获取当前时区偏移（以分钟为单位）
            var timezoneOffset = currentDate.getTimezoneOffset();

            // 将时区偏移添加到当前时间
            currentDate.setMinutes(currentDate.getMinutes() - timezoneOffset);

            // 格式化当前时间为YYYY-MM-DDTHH:MM，并设置为输入字段的值
            document.getElementById("end-time").value = currentDate.toISOString().slice(0, 16);
        });


}

function rule_register(){
    var ruleNameInput = document.querySelector('#add-rule-modal input[name="rule-name"]');
    var ruleNumberInput = document.querySelector('#add-rule-modal input[name="rule-number"]');
    var ruleName = ruleNameInput.value;
    var ruleNumber = ruleNumberInput.value;

    var formData = new FormData();
    formData.append('rule-name',ruleName)
    formData.append('rule-number',ruleNumber)

    // console.log(ruleName)
    // console.log(ruleNumber)

    fetch('api/rule', {
        method: 'POST',
        body: formData,
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(responseData) {
            var loadingModal = document.querySelector('#add-rule-callback-modal');
            if (responseData.success) {
                loadingModal.innerHTML = get_success_modal("规则添加成功！！","规则ID:"+responseData.msg.rule_id)
                time_line_inner()

            } else {
                loadingModal.innerHTML = get_fail_modal("添加失败",responseData.msg,responseData.error_post_form)
            }
        })
}
function user_register() {
    var userNameInput = document.querySelector('#add-user-modal input[name="user-name"]');
    var userQQInput = document.querySelector('#add-user-modal input[name="user-qq"]');

    var userName = userNameInput.value;
    var userQQ = userQQInput.value;

    var formData = new FormData();
    formData.append('user-name',userName)
    formData.append('user-qq',userQQ)

    fetch('api/user', {
        method: 'POST',
        body: formData,
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(responseData) {
            var loadingModal = document.querySelector('#add-user-callback-modal');
            if (responseData.success) {
                loadingModal.innerHTML = get_success_modal("登记成功！","恭喜你，你已经成为一名雀士了！")
                time_line_inner()
                user_ltb.update_table()
            } else {
                loadingModal.innerHTML = get_fail_modal("登记失败",responseData.msg,responseData.error_post_form)
            }
        })
}


function add_yaku(){
    const user_qq = document.getElementById("yakuman-user-select").value
    const yakuman = document.getElementById("yakuman-name").value
    const count = document.getElementById("yakuman-count").value
    const formData = new FormData()
    formData.append("user-qq",user_qq)
    formData.append("ya-ku",yakuman)
    formData.append("count",count)
    formData.append("game-id",gameId)
    fetch('api/ya_ku_man',{
        method:'POST',
        body:formData,
    }).then(function (response){
        return response.json()
    }).then(function (data) {
        var loadingModal = document.querySelector('#add-yakuman-callback-modal');
        if (data.success){
            loadingModal.innerHTML = get_success_modal("添加成功！","")
            inner_yakuman()
        }else {
            loadingModal.innerHTML = get_fail_modal("添加失败",data.msg,data.error_post_form)
        }
    })
}

function add_note(){
    var note = document.getElementById("note-area").value
    const formData = new FormData()
    formData.append("note",note)
    formData.append("game-id",gameId)
    fetch('api/game_note',{
        method:'PUT',
        body:formData,
    }).then(function (response){
        return response.json()
    }).then(function (data) {
        var loadingModal = document.querySelector('#add-note-callback-modal');
        if (data.success){
            loadingModal.innerHTML = get_success_modal("创建成功！",note)
            game_info_inner()
        }else {
            loadingModal.innerHTML = get_fail_modal("创建失败",data.msg,data.error_post_form)
        }
    })
}

function game_register(){
    var starting_points = document.getElementById('starting-points').value
    var rule_name = document.getElementById('rule-name').value
    var note = document.getElementById('note').value
    var end_time = document.getElementById('end-time').value
    var rule_id = null
    var number = null

    var rules_options = datalistRule.querySelectorAll('#rules option');
    var user_options = datalistUser.querySelectorAll('#users option');

    for (let i = 0; i < rules_options.length; i++) {
        const option = rules_options[i];
        if (option.value === rule_name) {
            rule_id = option.getAttribute('rule-id');
            number = option.getAttribute('rule-number');
            break;
        }
    }


    var formData = new FormData();

    formData.append('starting-points',starting_points)
    formData.append('rule-id',rule_id)
    formData.append('note',note)
    formData.append('end-time',end_time)
    formData.append('number',number)

    const userNames = document.querySelectorAll('input[id^="user-name-"]');
    const userScores = document.querySelectorAll('input[id^="user-score-"]');

    // 通过循环遍历获取每个输入元素的值
    userNames.forEach(function(input) {
        var user_qq = null
        for (let i = 0; i < user_options.length; i++) {
            const option = user_options[i];
            if (option.value === input.value) {
                user_qq = option.getAttribute('user-qq');
                break;
            }
        }
        formData.append(input.id.replace('-name-','-qq-'),user_qq)
    });

    userScores.forEach(function(input) {
        formData.append(input.id,input.value)
    });


    fetch('api/game', {
        method: 'POST',
        body: formData,
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(responseData) {
            var loadingModal = document.querySelector('#add-game-callback-modal');
            if (responseData.success) {
                loadingModal.innerHTML = get_success_modal("对局记录成功！","success")
                time_line_inner()
                //last_game_inner()
                game_ltb.update_table()

            } else {
                loadingModal.innerHTML = get_fail_modal("对局记录失败",responseData.msg,responseData.error_post_form)
            }
        })
}