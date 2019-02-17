// _____________________________________________________
// storage.js
// 読み出したり書き出したりする操作のwrapper


// _____________________________________________________
// backup

export function restoreBackupJson() {
    const stored = localStorage.getItem("backup");
    if (!stored) return null;
    return JSON.parse(stored);
}
export function storeBackupJson(json) {
    localStorage.setItem("backup", JSON.stringify(json));
}

// _____________________________________________________
// template / snippet

export function storeTemplate(lang, text) {
    let stored = localStorage.getItem("template");
    let json = !stored ? {} : JSON.parse(stored);
    json[lang] = text;
    localStorage.setItem("template", JSON.stringify(json));
}


export function loadTemplate(lang) {
    let stored = localStorage.getItem("template");
    if (!stored) return null;
    let val = JSON.parse(stored)[lang];
    return val ? val : null;
}