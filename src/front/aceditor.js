// _____________________________________________________
// aceditor.js
// ace部品の操作のwrapper

const $ = require('jQuery');

let aceditor = null;
const convertCmd2Edt = {};

// _____________________________________________________
// initialize


$(() => {
    aceditor = ace.edit("aceditor");
    aceditor.setTheme("ace/theme/monokai");
    aceditor.getSession().setMode("ace/mode/ruby");
    aceditor.setOptions({
        enableBasicAutocompletion: true,
        //enableSnippets: true,
        enableLiveAutocompletion: true
    });
    aceditor.setShowInvisibles(true);
    aceditor.setFontSize(14);

    $("#aceditorEdge").on("onresize", () => {
        aceditor.resize();
    });
});


// _____________________________________________________
// getter / setter

export function getValue() {
    return aceditor.getValue();
}

export function setValue(text) {
    aceditor.setValue(text, -1);
}

export function registerLang(cmd, edt) {
    convertCmd2Edt[cmd] = edt;
}


// _____________________________________________________
// interface

export function changeCodeLang(cmd) {
    const edt = convertCmd2Edt[cmd];
    if (!edt) return;
    aceditor.getSession().setMode("ace/mode/" + convertCmd2Edt[cmd]);
}

/**
 * 
 * @param {{text:String, row:Number, column:Number, type: "error" | "warning" | "information"}} json 
 */
export function setAnnotations(json) {
    aceditor.getSession().setAnnotations(json);
}

export function clearAnnotations() {
    aceditor.getSession().clearAnnotations();
}