// _____________________________________________________
// interface.js
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

export function getOptionValues(cmd) {
    const options = {};
    $('#div_options > div')
        .filter((i, e) => ($(e).data('cmd') == cmd))
        .find('select')
        .each((i, e) => {
            options[$(e).data('key')] = $(e).val();
        });
    return options;
}


// _____________________________________________________
// events

export function onClickHalt(handler) {
    $('#btn_halt').on('click', () => {
        handler();
    });
}




// _____________________________________________________
// manipulate

export function changeVisibleRecipes(cmd) {
    $('#div_recipes > div').filter((i, e) => ($(e).data('cmd') == cmd)).removeClass('d-none');
    $('#div_recipes > div').filter((i, e) => ($(e).data('cmd') != cmd)).addClass('d-none');
    $('#div_options > div').filter((i, e) => ($(e).data('cmd') == cmd)).removeClass('d-none');
    $('#div_options > div').filter((i, e) => ($(e).data('cmd') != cmd)).addClass('d-none');
}


// _____________________________________________________
// setup

const clickRecipeHandlers = [];
export function addLaunchRecipeListener(handler) {
    clickRecipeHandlers.push(handler);
}


export function appendTask(taskInfo) {
    appendRecipes(taskInfo);
    appendTaskOptions(taskInfo);
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
