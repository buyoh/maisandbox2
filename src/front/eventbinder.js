// _____________________________________________________
// socket.js
// ボタン押下時の操作等のeventと初期化を記述する

const $ = require('jquery');
const Interface = require('./interface');
const Editor = require('./aceditor');
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
        Storage.storeTemplate(Interface.getChosenLang(), Editor.getValue());
    });

    $('#btn_loadTemplate').on('click', () => {
        Editor.setValue(Storage.loadTemplate(Interface.getChosenLang()));
    });

    $('#selector_codelang').change(() => {
        let dom = $('#selector_codelang option:selected');
        let cmd = dom.data('cmd');
        let lang = dom.data('lang');
        if (cmd === '') return;

        Interface.changeVisibleRecipes(cmd, lang);
    });

}


function initialize() {

    Socket.getCatalog((allLangInfo) => {
        // TODO: 言語ごとの配列にまとめる
        for (let langInfo of allLangInfo)
            Interface.addLanguage(langInfo);
        Interface.rechooseLang();
    });
}

// _____________________________________________________
// socket

// submitしたjobの状況がサーバから送られてくる
Socket.addProgressListener((json) => {
    // console.log(json);

    if (json.type === 'halted') {
        Interface.appendResultLog('halted', '', 'info');
        return;
    }

    if (json.type === 'success') {
        const d =
            $('#div_resultlogs > div').first().find('.val')
                .filter((i, e) => ($(e).data('key') == 'stdout'));
        if (d.length === 1)
            Interface.displayStdout(d.text());
    }

    const state =
        json.type === 'continue' || json.type === 'success' ? 'success' :
            json.type === 'failed' ? 'warning' :
                json.type === 'error' ? 'danger' :
                    'info';

    Interface.appendResultLog(
        json.data.commandName ? '[' + json.data.commandName + ']' + json.type : json.type,
        json.data, state, json.type === 'progress'
    );

    if (json.data && json.data.key) {
        Interface.displayStdout(json.data.stdout, json.data.key);
    }

    if (json.data.note) {
        Editor.setAnnotations(json.data.note);
    }

});