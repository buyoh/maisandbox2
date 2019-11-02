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

    Interface.LaunchPad.onClickHalt(() => {
        Socket.emitHalt();
    });

    Interface.EditPanel.onClickStoreTemplate(() => {
        Storage.storeTemplate(Interface.getSelectedTaskCmd(), Interface.Editor.getValue());
    });

    Interface.EditPanel.onClickLoadTemplate(() => {
        Interface.Editor.setValue(Storage.loadTemplate(Interface.getSelectedTaskCmd()));
    });

    Interface.LaunchPad.addLaunchRecipeListener((recipe) => {
        const info = Interface.gatherInfo();
        info.recipe = recipe;
        Interface.Results.clearResults();
        Interface.Editor.clearAnnotations();
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

Socket.onConnect(() => {
    Interface.Indicator.setState('connection', 'connected');
});

Socket.onDisconnect(() => {
    Interface.Indicator.setState('connection', 'disconnected');
});

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
            Interface.Stdios.displayStdout(d.text());
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
        Interface.Stdios.displayStdout(json.data.stdout, json.data.key);
    }

    if (json.data.note) {
        Interface.Editor.setAnnotations(json.data.note);
    }
});
