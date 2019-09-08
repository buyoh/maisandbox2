// _____________________________________________________
// socket.js
// ボタン押下時の操作等のeventと初期化を記述する

const $ = require('jquery');
const Interface = require('./interface');
const Storage = require('./storage');
const Socket = require('./socket');


$(() => {
    bundEvents();
    initialize();
});


function bundEvents() {

    $('#btn_halt').on('click', () => {
        Socket.emitHalt();
    });

    $('#btn_storeTemplate').on('click', () => {
        Storage.storeTemplate(Interface.getSelectedTask(), Interface.Editor.getValue());
    });

    $('#btn_loadTemplate').on('click', () => {
        Interface.Editor.setValue(Storage.loadTemplate(Interface.getSelectedTask()));
    });

    $('#selector_codelang').change(() => {
        let dom = $('#selector_codelang option:selected');
        let cmd = dom.data('cmd');
        let lang = dom.data('lang');
        if (cmd === '') return;

        Interface.Panel.changeVisibleRecipes(cmd, lang);
    });

    Interface.Panel.addClickRecipeListener((recipe) => {
        const info = Interface.Panel.gatherInfo();
        info.recipe = recipe;
        Interface.Results.clearResults();
        Socket.emitSubmit(info);
    });

}


function initialize() {
    Socket.getCatalog((allLangInfo) => {
        Interface.appendTasks(allLangInfo);
    });
}

// _____________________________________________________
// socket

// submitしたjobの状況がサーバから送られてくる
Socket.addProgressListener((json) => {
    // console.log(json);

    if (json.type === 'halted') {
        Interface.Results.appendResult('halted', '', 'info');
        return;
    }

    if (json.type === 'success') {
        const d =
            $('#div_resultlogs > div').first().find('.val')
                .filter((i, e) => ($(e).data('key') == 'stdout'));
        if (d.length === 1)
            Interface.Panel.displayStdout(d.text());
    }

    const state =
        json.type === 'continue' || json.type === 'success' ? 'success' :
            json.type === 'failed' ? 'warning' :
                json.type === 'error' ? 'danger' :
                    'info';

    Interface.Results.appendResult(
        json.data.commandName ? '[' + json.data.commandName + ']' + json.type : json.type,
        json.data, state, json.type === 'progress'
    );

    if (json.data && json.data.key) {
        Interface.Panel.displayStdout(json.data.stdout, json.data.key);
    }

    if (json.data.note) {
        Interface.Editor.setAnnotations(json.data.note);
    }

});