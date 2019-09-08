// _____________________________________________________
// interface.js
// UI全体のwrapper，特に複数の部品に影響があるもの

const $ = require('jquery');
const Editor = require('./aceditor');
const Stdios = require('./stdios');

// const Languages = require('./languages');


// メモ化
const _m_memorized = {};

function m$(html) {
    return _m_memorized[html] ?
        _m_memorized[html] :
        (_m_memorized[html] = $(html));
}

// _____________________________________________________
// initialize

$(() => {
    $('textarea.enabletabs').keydown((e) => {
        if (e.keyCode === 9) {
            e.preventDefault(); // デフォルト動作の中止
            var elem = e.target;
            var val = elem.value;
            var pos = elem.selectionStart;
            elem.value = val.substr(0, pos) + '\t' + val.substr(pos, val.length);
            elem.setSelectionRange(pos + 1, pos + 1);
        }
    });
});


// _____________________________________________________
// getter

export function getChosenLang() {
    return $('#selector_codelang option:selected').data('cmd');
}


export function gatherInfo() {
    const cmd = getChosenLang();
    const options = {};
    $('#div_options > div')
        .filter((i, e) => ($(e).data('cmd') == cmd))
        .find('select')
        .each((i, e) => {
            options[$(e).data('key')] = $(e).val();
        });

    return {
        txt_stdins: Stdios.getStdins(true),
        txt_code: Editor.getValue(),
        cmd: cmd,
        options: options
    };
}


// _____________________________________________________
// manipulate

/**
 * cmd言語を選んだ状態にする
 * @param {*} cmd 
 */
export function chooseLang(cmd) {
    let dom = $('#selector_codelang option').filter((i, e) => ($(e).data('cmd') == cmd));
    if (dom.length > 0)
        dom.prop('selected', true);
    else
        m$('#selector_codelang').data('LazyChoiceCmd', cmd);

    m$('#selector_codelang').change();
}


/**
 * addTask等によって言語関係を変更したら最後にこれを呼び出す
 */
export function rechooseLang() {
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


export function changeVisibleRecipes(cmd, lang) {
    $('#div_recipes > div').filter((i, e) => ($(e).data('cmd') == cmd)).removeClass('d-none');
    $('#div_recipes > div').filter((i, e) => ($(e).data('cmd') != cmd)).addClass('d-none');
    $('#div_options > div').filter((i, e) => ($(e).data('cmd') == cmd)).removeClass('d-none');
    $('#div_options > div').filter((i, e) => ($(e).data('cmd') != cmd)).addClass('d-none');
    Editor.changeCodeLang(lang);
}


export function displayStdout(text, id) {
    if (id) {
        const li = {};
        li[id] = text;
        Stdios.setStdouts(li);
    }
}


export function clearResultLogs() {
    $('#div_resultlogs').empty();
    Editor.clearAnnotations();
}

export function appendResultLog(title, message, classtype, isProgressing = false) {
    if ($('#div_resultlogs > div').first().data('isprog')) {
        $('#div_resultlogs > div').first().remove();
    }
    const titledom = $('<div></div>').text(title)
        .addClass('alert-' + classtype + ' title');
    const bodydom = $('<div></div>')
        .addClass('body')
        .addClass('d-none');

    if (typeof message === 'object') {
        for (const key in message) {
            const msg = '' + message[key];
            if (msg.match(/\n/)) {
                const keydom1 = $('<span></span>').text(key);
                const keydom2 = $('<button></button>').text('[copy]').css('font-size', 'small').addClass('btn btn-sm btn-primary');
                const valdom = $('<pre></pre>').addClass('val').text(message[key]).data('key', key);
                bindToggler('click', keydom1, valdom);
                bindCopyButton('click', keydom2, valdom);
                const keydom = $('<div></div>').addClass('key').append(keydom1).append(keydom2);
                bodydom.append(keydom).append(valdom);
                bodydom.append(keydom).append(valdom);
            } else {
                bodydom.prepend(
                    $('<div></div>')
                        .addClass('keypair')
                        .append($('<div></div>').addClass('key').text(key))
                        .append($('<div></div>').addClass('val').text(msg).data('key', key))
                );
            }
        }
    } else {
        bodydom.append(
            $('<pre></pre>').text(message)
        );
    }
    bindToggler('click', titledom, bodydom);
    $('#div_resultlogs').prepend(
        $('<div></div>')
            .addClass('resultLog')
            .data('isprog', isProgressing)
            .append(titledom).append(bodydom)
    );
}


// _____________________________________________________
// setup


const clickRecipeHandlers = [];
export function addClickRecipeListener(handler) {
    clickRecipeHandlers.push(handler);
}


export function addTask(taskInfo) {
    // TODO: 少し長いので分割する

    // const langInfo = Languages.languages[taskInfo.language];

    const category = taskInfo.category || 'default';

    let optg = $('#selector_codelang optgroup[label="' + category + '"]');

    if (optg.length === 0)
        optg = $('<optgroup></optgroup>')
            .attr('label', category)
            .appendTo(m$('#selector_codelang'));

    // selector
    $('<option></option>')
        .data('cmd', taskInfo.cmd)
        .data('lang', taskInfo.language)
        .text(taskInfo.language)
        .appendTo(optg);

    // recipes
    {
        const domc = $('<div></div>')
            .data('cmd', taskInfo.cmd);
        for (let name of Object.keys(taskInfo.recipes)) {
            domc.append(
                $('<button></button>')
                    .addClass('btn btn-sm btn-primary')
                    .text(name)
                    .on('click', {
                        recipe: name
                    }, (e) => {
                        const recipe = e.data.recipe;
                        for (let h of clickRecipeHandlers)
                            h(recipe);
                    })
            );
        }
        m$('#div_recipes').append(domc);
    }

    // options
    {
        const domc = $('<div></div>').data('cmd', taskInfo.cmd);
        for (let name in taskInfo.options) {
            const dom = $('<select></select>')
                .data('key', name)
                .addClass('form-control form-control-sm')
                .css('width', 'inherit');
            for (let val of taskInfo.options[name])
                dom.append(
                    $('<option></option>')
                        .text(val)
                        .val(val)
                );
            domc.append(
                $('<div></div>').addClass('keypair')
                    .append($('<div></div>').addClass('key').text(name))
                    .append(dom.addClass('val'))
            );
        }
        m$('#div_options').append(domc);
    }


}



// _____________________________________________________
// (internal)


/**
 * buttondom を event すると class をトグルする
 * @param {string} event 
 * @param {JQuery} buttondom 
 * @param {JQuery} hiddendom 
 */
function bindToggler(event, buttondom, hiddendom, buttondomClass = '', hiddendomClass = 'd-none') {
    buttondom.on(event, {
        fr: buttondom,
        to: hiddendom
    }, (e) => {
        $(e.data.fr).toggleClass(buttondomClass);
        $(e.data.to).toggleClass(hiddendomClass);
    });
}


function bindCopyButton(event, buttondom, textdom) {
    buttondom.on(event, {
        tg: textdom
    }, (e) => {
        copyTextToClipboard($(e.data.tg).text());
    });
}

function copyTextToClipboard(text) {
    let tempdom = $('#__clipboard');
    if (tempdom.length == 0)
        tempdom = $('<textarea id=\'__clipboard\'></textarea>')
            .appendTo($('body'));
    tempdom.val(text)
        .css('display', 'inline');
    copyDomToClipboard(tempdom);
    tempdom.val('')
        .css('display', 'none');
}

function copyDomToClipboard(dom) {
    dom.select();
    document.execCommand('copy');
}