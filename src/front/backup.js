// _____________________________________________________
// backup.js
// バックアップ機能

const $ = require('jquery');
const Interface = require('./interface');
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

    Interface.Stdios.restoreStdin(json.txt_stdins);
    Interface.Editor.setValue(json.txt_code);

    Interface.Panel.chooseLang(json.cmd);
}


export function storeBackup() {
    Storage.storeBackupJson({
        txt_stdins: Interface.Stdios.dumpStdin(),
        txt_code: Interface.Editor.getValue(),
        cmd: Interface.Panel.getChosenLang()
    });
}