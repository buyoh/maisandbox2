// _____________________________________________________
// editpanel.js
// aceditorの外側にある編集ボタンの機能など。

const $ = require('jquery');


// _____________________________________________________
// events

export function onClickStoreTemplate(handler) {
    $('#btn_storeTemplate').on('click', () => {
        handler();
    });
}

export function onClickLoadTemplate(handler) {
    $('#btn_loadTemplate').on('click', () => {
        handler();
    });
}
