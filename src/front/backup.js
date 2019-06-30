// _____________________________________________________
// backup.js
// バックアップ機能

const $ = require('jQuery');
const Editor = require('./aceditor');
const Interface = require('./interface');
const Stdios = require('./stdios');
const Storage = require('./storage');



// _____________________________________________________
// initialize

$(() => {
    restoreBackup();
    $(window).on('unload', () => {
        storeBackup();
    });
    setInterval(() => {
        storeBackup();
    }, 1000 * 600);

    $('#btn_forcebackup').on('click', () => {
        storeBackup();
    });
});


// _____________________________________________________
// backup

export function restoreBackup() {
    const json = Storage.restoreBackupJson();
    if (!json) return;

    // 互換性のため
    if (!json.txt_stdins) json.txt_stdins = [json.txt_stdin];

    Stdios.restoreStdin(json.txt_stdins);
    Editor.setValue(json.txt_code);

    Interface.chooseLang(json.cmd);
}


export function storeBackup() {
    Storage.storeBackupJson({
        txt_stdins: Stdios.dumpStdin(),
        txt_code: Editor.getValue(),
        cmd: Interface.getChosenLang()
    });
}