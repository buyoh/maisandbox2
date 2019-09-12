// _____________________________________________________
// aceditor.js
// ace部品の操作のwrapper

const $ = require('jquery');
let ace = require('ace-builds/src-min/ace');
const Languages = require('./../languages');

let aceditor = null;
// const langInfo = {};

// _____________________________________________________
// initialize


$(() => {
    ace.config.set('basePath', 'ext');
    aceditor = ace.edit('aceditor');
    ace.config.loadModule('ext/language_tools', () => {
        aceditor.setTheme('ace/theme/monokai');
        aceditor.getSession().setMode('ace/mode/ruby');
        aceditor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        aceditor.setShowInvisibles(true);
        aceditor.setFontSize(14);

        const snippetManager = ace.require('ace/snippets').snippetManager;
        ace.config.loadModule('ace/snippets/javascript', (mod) => {
            snippetManager.files.javascript = mod;

            mod.snippets = snippetManager.parseSnippetFile(mod.snippetText);
            snippetManager.register(mod.snippets, mod.scope);
        });
        ace.config.loadModule('ace/snippets/c_cpp', (mod) => {
            snippetManager.files.c_cpp = mod;

            mod.snippets = snippetManager.parseSnippetFile(mod.snippetText);
            mod.snippets.push(
                {
                    'content': 'repeat(${1:i}, ${2:N}) {\n\t$3\n}',
                    'name': 'repeat',
                    'tabTrigger': 'repeat'
                }
            );
            snippetManager.register(mod.snippets, mod.scope);
        });
    });

    $('#aceditorEdge').on('onresize', () => {
        aceditor.resize();
    });
});


// _____________________________________________________
// getter / setter

export function getValue() {
    return aceditor.getValue();
}

export function setValue(text) {
    if (text === null) text = '';
    aceditor.setValue(text, -1);
}


// _____________________________________________________
// interface

export function changeLanguage(lang) {
    let info = Languages.languages[lang];
    if (!info)
        info = Languages.languages['default'];
    const s = aceditor.getSession();
    s.setMode('ace/mode/' + info.editor);
    s.setTabSize(info.tabwidth);
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