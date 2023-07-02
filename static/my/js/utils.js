const duan_wei_1 = '<span class="badge bg-lime">初心</span>'
const duan_wei_2 = '<span class="badge bg-green">雀士</span>'
const duan_wei_3 = '<span class="badge bg-yellow">雀杰</span>'
const duan_wei_4 = '<span class="badge bg-orange">雀豪</span>'
const duan_wei_5 = '<span class="badge bg-red">雀圣</span>'
const duan_wei_6 = '<span class="badge bg-indigo">魂天</span>'
function get_score_title_span(score_title) {
    switch (score_title){
        case '初心':return duan_wei_1;
        case '雀士':return duan_wei_2;
        case '雀杰':return duan_wei_3;
        case '雀豪':return duan_wei_4;
        case '雀圣':return duan_wei_5;
        case '魂天':return duan_wei_6;
    }
}