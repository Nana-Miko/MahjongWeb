const left_svg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M5 12l14 0"></path>
                                            <path d="M5 12l6 6"></path>
                                            <path d="M5 12l6 -6"></path>
                                        </svg>`
const right_svg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M5 12l14 0"></path>
                                            <path d="M13 18l6 -6"></path>
                                            <path d="M13 6l6 6"></path>
                                        </svg>`

class LimitTables {
    left_btm_dom;
    right_btm_dom;
    index = 0;
    limit = 5;
    offset = 0;
    dom;
    table_update_func;

    constructor(dom,limit,btm_class,table_update_func) {
        this.limit = limit;
        this.dom = dom;
        this.left_btm_dom = document.createElement('button');
        this.left_btm_dom.setAttribute('class',btm_class);
        this.left_btm_dom.onclick = this.leftBtmOnClick;
        this.left_btm_dom.innerHTML = left_svg;
        this.right_btm_dom = document.createElement('button');
        this.right_btm_dom.setAttribute('class',btm_class);
        this.right_btm_dom.onclick = this.rightBtmOnClick;
        this.right_btm_dom.innerHTML = right_svg;

        this.table_update_func = table_update_func;

        const div_dom = document.createElement('div');
        div_dom.setAttribute('class','row row-deck row-cards');
        const col_4_l = document.createElement('div');
        col_4_l.setAttribute('class','col-4');
        const col_4_r = document.createElement('div');
        col_4_r.setAttribute('class','col-4');
        const col_4_m = document.createElement('div');
        col_4_m.setAttribute('class','col-4');

        const card_l =  document.createElement('div');
        card_l.setAttribute('class','card-btn');
        const card_r =  document.createElement('div');
        card_r.setAttribute('class','card-btn');
        const card_m =  document.createElement('div');
        card_m.setAttribute('class','card-lg');

        this.index_dom = document.createElement('h5');
        this.index_dom.textContent = '';


        card_l.appendChild(this.left_btm_dom);
        card_r.appendChild(this.right_btm_dom);
        card_m.appendChild(this.index_dom);

        col_4_l.appendChild(card_l);
        col_4_r.appendChild(card_r);
        col_4_m.appendChild(card_m);

        div_dom.appendChild(col_4_l);
        div_dom.appendChild(col_4_m);
        div_dom.appendChild(col_4_r);

        dom.appendChild(div_dom);

        this.setLeftDisable();
        this.update_btm(this.table_update_func(this.limit,this.offset));
    }
    setLeftDisable(){
        this.left_btm_dom.setAttribute('style','display: none')
    }
    setRightDisable(){
        this.right_btm_dom.setAttribute('style','display: none')
    }
    setLeftEnable(){
        this.left_btm_dom.removeAttribute('style')
    }
    setRightEnable(){
        this.right_btm_dom.removeAttribute('style')
    }

    update_btm(res_promise) {
        res_promise.then((length) => { // 使用箭头函数定义回调函数
            if (length < this.limit) {
                this.setRightDisable();
            } else {
                this.setRightEnable();
            }
            if (this.index === 0) {
                this.setLeftDisable();
            } else {
                this.setLeftEnable();
            }
        });
    }

    leftBtmOnClick = () => {
        this.index--;
        this.offset = this.offset - this.limit;
        this.update_btm(this.table_update_func(this.limit, this.offset));
    }
    rightBtmOnClick = () => {
        this.index++;
        this.offset = this.offset + this.limit;
        //console.log(this.offset)
        this.update_btm(this.table_update_func(this.limit, this.offset));
    }

    update_table(){
        this.index = 0;
        this.offset = 0;
        this.update_btm(this.table_update_func(this.limit,this.offset));
    }
}