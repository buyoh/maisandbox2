// _____________________________________________________
// interface.js
// UI全体のwrapper，特に複数の部品に影響があるもの

const $ = require('jquery');
const Editor = require('./aceditor');
const Stdios = require('./stdios');


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

function getSelectedTask() { // TODO: moved TaskSelector
    return $('#selector_codelang option:selected').data('cmd');
}


export function gatherInfo() {
    const cmd = getSelectedTask();
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

export function changeVisibleRecipes(cmd, lang) {
    $('#div_recipes > div').filter((i, e) => ($(e).data('cmd') == cmd)).removeClass('d-none');
    $('#div_recipes > div').filter((i, e) => ($(e).data('cmd') != cmd)).addClass('d-none');
    $('#div_options > div').filter((i, e) => ($(e).data('cmd') == cmd)).removeClass('d-none');
    $('#div_options > div').filter((i, e) => ($(e).data('cmd') != cmd)).addClass('d-none');
    Editor.changeCodeLang(lang);
}


export function displayStdout(text, id) { // TODO: ????
    if (id) {
        const li = {};
        li[id] = text;
        Stdios.setStdouts(li);
    }
}


// _____________________________________________________
// setup

const clickRecipeHandlers = [];
export function addClickRecipeListener(handler) {
    clickRecipeHandlers.push(handler);
}



function appendRecipes(taskInfo) {
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


function appendTaskOptions(taskInfo) {
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


export function appendTask(taskInfo) { // TODO: appendTask
    appendRecipes(taskInfo);
    appendTaskOptions(taskInfo);
}
