const $ = require('jQuery');
const Editor = require('./aceditor');
const Interface = require('./interface');
const Stdios = require('./stdios');

// _____________________________________________________
// initialize

$(()=>{
    restoreBackup();
    $(window).on("unload", ()=>{storeBackup();});
    setInterval(()=>{storeBackup();},1000*600);
});


// _____________________________________________________
// backup

export function restoreBackup(){
    let stored = localStorage.getItem("backup");
    if (!stored) return;
    
    let json = JSON.parse(stored);

    Stdios.setStdinLegacy(json.txt_stdin);
    Editor.setValue(json.txt_code);

    Interface.chooseLang(json.cmd);
}


export function storeBackup(){
    const json = {
        txt_stdin:   Stdios.getStdinLegacy(),
        txt_code:    Editor.getValue(),
        cmd:         Interface.getChosenLang()
    };
    localStorage.setItem("backup", JSON.stringify(json));
}


// _____________________________________________________
// template / snippet

export function storeTemplate(lang, text){
    let stored = localStorage.getItem("template");
    let json = !stored ? {} : JSON.parse(stored);
    json[lang] = text;
    localStorage.setItem("template", JSON.stringify(json));
}


export function loadTemplate(lang){
    let stored = localStorage.getItem("template");
    if (!stored) return null;
    let val = JSON.parse(stored)[Interface.getChosenLang()];
    return val ? val : null;
}

