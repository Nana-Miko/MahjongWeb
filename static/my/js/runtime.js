function rule_check(){
    const ruleNameInputElement = document.getElementById('rule-name')
    const errorTipsElement = document.getElementById('rule-error-tips');

    ruleNameInputElement.addEventListener('input', function() {
        const value = ruleNameInputElement.value;
        const options = document.querySelectorAll('#rules option');

        let isValid = false;
        options.forEach(option => {
            if (option.value === value) {
                isValid = true;
            }
        });

        if (isValid) {
            ruleNameInputElement.classList.remove('is-invalid');
            ruleNameInputElement.classList.add('is-valid', 'mb-2');
            errorTipsElement.style.display = 'none';
        } else {
            ruleNameInputElement.classList.remove('is-valid', 'mb-2');
            ruleNameInputElement.classList.add('is-invalid');
            errorTipsElement.style.display = 'block';
        }
    });
}
function user_check(){
    const ruleNameInput = document.getElementById('rule-name');
    const userNamesFieldset = document.getElementById('user-fieldset');
    const startingPointsInput = document.getElementById('starting-points');

    ruleNameInput.addEventListener('input', updateNumberOfUserNames);

    function updateNumberOfUserNames() {
        const selectedOption = ruleNameInput.value.trim().toLowerCase();
        const rulesOptions = document.querySelectorAll('#rules option');
        const startingPoints = startingPointsInput.value;

        for (const option of rulesOptions) {
            const ruleName = option.value.trim().toLowerCase();
            const ruleNumber = parseInt(option.getAttribute('rule-number'));

            if (selectedOption === ruleName) {
                userNamesFieldset.innerHTML = ''; // 清空已有的user-name input
                const label = document.createElement('label')
                label.textContent = '最终得点';
                label.classList.add('form-label');
                userNamesFieldset.appendChild(label)

                for (let i = 1; i <= ruleNumber; i++) {
                    const label = document.createElement('label');
                    label.textContent = `雀士${i}`;
                    label.classList.add('form-label');

                    const name_input = document.createElement('input');
                    name_input.id = `user-name-${i}`;
                    name_input.name = `user-name-${i}`;
                    name_input.classList.add('form-control');
                    name_input.setAttribute('list', 'users');
                    name_input.placeholder = `雀士${i} 名称`;

                    const score_input = document.createElement('input');
                    score_input.id = `user-score-${i}`;
                    name_input.name = `user-score-${i}`;
                    score_input.classList.add('form-control');
                    score_input.type='number';
                    score_input.value = startingPoints;


                    const scoreErrorTips = document.createElement('div');
                    scoreErrorTips.id = `user-score-error-tips-${i}`;
                    scoreErrorTips.classList.add('invalid-feedback');
                    scoreErrorTips.style.display = 'none';
                    scoreErrorTips.textContent = '点数分配不正确，请检查';


                    score_input.addEventListener('input',function () {
                        const score_inputs = document.querySelectorAll('input[id^="user-score-"]');
                        const score_tips = document.querySelectorAll('div[id^="user-score-error-tips-"]');
                        let score_count=0;
                        for (let j = 0; j < score_inputs.length; j++) {
                            score_count+=Number(score_inputs[j].value)
                        }

                        if (score_count===ruleNumber*startingPoints){
                            for (let j = 0; j < score_inputs.length; j++) {
                                score_inputs[j].classList.remove('is-invalid');
                                score_inputs[j].classList.add('is-valid', 'mb-2');
                                score_tips[j].style.display = 'none';
                            }

                        } else {
                            score_input.classList.remove('is-valid', 'mb-2');
                            score_input.classList.add('is-invalid');
                            scoreErrorTips.style.display = 'block';
                        }
                    })

                    const errorTips = document.createElement('div');
                    errorTips.id = `user-error-tips-${i}`;
                    errorTips.classList.add('invalid-feedback');
                    errorTips.style.display = 'none';
                    errorTips.textContent = '该雀士未登记';

                    const errorScript = document.createElement('script');
                    errorScript.textContent = `    const userNameInputElement${i} = document.getElementById('user-name-${i}')
    const errorTipsElement${i} = document.getElementById('user-error-tips-${i}')
    userNameInputElement${i}.addEventListener('input',function (){
        const value = userNameInputElement${i}.value;
        const options = document.querySelectorAll('#users option');

        let isValid = false;
        options.forEach(option => {
            if (option.value === value) {
                isValid = true;
            }
        });

        if (isValid) {
            userNameInputElement${i}.classList.remove('is-invalid');
            userNameInputElement${i}.classList.add('is-valid', 'mb-2');
            errorTipsElement${i}.style.display = 'none';
        } else {
            userNameInputElement${i}.classList.remove('is-valid', 'mb-2');
            userNameInputElement${i}.classList.add('is-invalid');
            errorTipsElement${i}.style.display = 'block';
        }
    })`

                    userNamesFieldset.appendChild(label);
                    userNamesFieldset.appendChild(name_input);
                    userNamesFieldset.appendChild(errorTips);
                    userNamesFieldset.appendChild(errorScript);
                    userNamesFieldset.appendChild(score_input);
                    userNamesFieldset.appendChild(scoreErrorTips);
                }

                userNamesFieldset.style.display = 'block';
                return;
            }
        }
        userNamesFieldset.style.display = 'none';


    }
}