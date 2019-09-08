// _____________________________________________________
// .js
// UI全体のwrapper，特に複数の部品に影響があるもの

const $ = require('jquery');


// メモ化
const _m_memorized = {};

function m$(html) {
    return _m_memorized[html] ?
        _m_memorized[html] :
        (_m_memorized[html] = $(html));
}


// _____________________________________________________
// getter

export function getSelectedTask() {
    return $('#selector_codelang option:selected').data('cmd');
}


// _____________________________________________________
// manipulate

/**
 * cmd言語を選んだ状態にする
 * @param {*} cmd 
 */
export function setSelectedTask(cmd) {
    let dom = $('#selector_codelang option').filter((i, e) => ($(e).data('cmd') == cmd));
    if (dom.length > 0) {
        dom.prop('selected', true); // 存在するなら、それを選ぶ
        m$('#selector_codelang').data('LazyChoiceCmd', null);
    }
    else
        m$('#selector_codelang').data('LazyChoiceCmd', cmd); // 存在しないなら、保存しておく

    m$('#selector_codelang').change();
}


export function appendTask(taskInfo) {
    const category = taskInfo.category || 'default';
    const optg = getCategoryOptgroup(category);

    $('<option></option>')
        .data('cmd', taskInfo.cmd)
        .data('lang', taskInfo.language)
        .text(taskInfo.language)
        .appendTo(optg);
}

/**
 * appendTask等によって言語関係を変更したら最後にこれを呼び出す
 */
export function pullSelectedTask() {
    const dom = m$('#selector_codelang');
    const appVal = dom.data('LazyChoiceCmd');
    if (appVal) {
        dom.data('LazyChoiceCmd', null);
        $('#selector_codelang option')
            .filter((i, e) => ($(e).data('cmd') == appVal))
            .prop('selected', true);
    }
    dom.change();
}

// _____________________________________________________
// internal

function getCategoryOptgroup(category) {
    let optg = $('#selector_codelang optgroup[label="' + category + '"]');
    if (optg.length === 0)
        optg = $('<optgroup></optgroup>')
            .attr('label', category)
            .appendTo(m$('#selector_codelang'));
    return optg;
}
