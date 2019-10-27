// _____________________________________________________
// aceditor.js
// ace部品の操作のwrapper

const $ = require('jquery');
let ace = require('ace-builds/src-min/ace');
const Languages = require('./../languages');

let aceditor = null;
let settings = Languages.default;

// _____________________________________________________
// initialize

function applySettings() {
    const s = aceditor.getSession();
    s.setMode('ace/mode/' + settings.editor);
    s.setTabSize(settings.tabWidth);
}

function initialized() {
    applySettings();
}

$(() => {
    ace.config.set('basePath', 'ext');
    aceditor = ace.edit('aceditor');
    ace.config.loadModule('ext/language_tools', () => {
        console.log(aceditor.getSession().getMode());
        aceditor.setTheme('ace/theme/monokai');
        console.log(aceditor.getSession().getMode());
        aceditor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        aceditor.setShowInvisibles(true);
        aceditor.setFontSize(14);

        const snippetManager = ace.require('ace/snippets').snippetManager;
        let nJobs = 0;
        for (let edt of Object.keys(
            Object.values(Languages.languages)
                .reduce((a, e) => (a[e.editor] = true, a), ({})))) {
            ace.config.loadModule('ace/snippets/' + edt, (mod) => {
                snippetManager.files[edt] = mod;
                mod.snippets = [];
                // disable default snippets
                // mod.snippets = snippetManager.parseSnippetFile(mod.snippetText);
                $.getJSON('snippets/' + edt + '.json')
                    .done((json) => {
                        mod.snippets = mod.snippets.concat(json);
                    })
                    .fail(() => { })
                    .always(() => {
                        snippetManager.register(mod.snippets, mod.scope);
                        if (--nJobs == 0) initialized();
                    });
            });
            ++nJobs;
        }
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
    if (!info) info = Languages.languages['default'];
    settings = info;
    applySettings();
}

/**
 *
 * @param {{text:String, row:Number, column:Number, type: "error" | "warning" |
 *     "information"}} json
 */
export function setAnnotations(json) {
    aceditor.getSession().setAnnotations(json);
}

export function clearAnnotations() {
    aceditor.getSession().clearAnnotations();
}