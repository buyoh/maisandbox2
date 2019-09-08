// _____________________________________________________
// stdio.js
// stdio部品の操作のwrapper

const $ = require('jquery');

let domStdioTemplate = null;
let nextInternalID = 0;


// _____________________________________________________
// initialize

$(() => {
    {
        const d = $('#div_stdios > .hiddenTemplate');
        d.removeClass('hiddenTemplate');
        d.find('textarea').val('');
        domStdioTemplate = d.detach();
    }
    appendField();

    $('#btn_appendstdio').on('click', () => {
        appendField();
    });
});


// _____________________________________________________
// getter / setter

export function getStdins(visibleonly = true) {
    const li = {};
    $('#div_stdios > div').each((i, e) => {
        const d = $(e);
        if (!visibleonly || !d.hasClass('minified')) {
            const c = d.data('components');
            li[c.internalID] = c.textareaStdin.val();
        }
    });
    return li;
}

export function setStdouts(li) {
    $('#div_stdios > div').each((i, e) => {
        const c = $(e).data('components');
        const txt = li[c.internalID];
        if (txt || txt === '') {
            c.textareaStdout.val(txt);
        }
    });
}


// _____________________________________________________
// manipulate

export function appendField() {
    $('#div_stdios').append(generateDom());
}

export function clearField() {
    $('#div_stdios').empty();
}


// _____________________________________________________
// backup

export function dumpStdin() {
    const li = [];
    $('#div_stdios > div').each((i, e) => {
        li.push($(e).data('components').textareaStdin.val());
    });
    return li;
}

export function restoreStdin(li) {
    clearField();
    for (let txt of li) {
        const d = generateDom();
        d.data('components').textareaStdin.val(txt);
        $('#div_stdios').append(d);
    }
}


// _____________________________________________________
// (internal)

function generateDom() {
    const dom = domStdioTemplate.clone();
    const components = {
        dom: dom,
        buttonMinify: dom.find('button[title=\'minify\']'),
        buttonClose: dom.find('button[title=\'close\']'),
        textareaStdin: dom.find('textarea[title=\'stdin\']'),
        textareaStdout: dom.find('textarea[title=\'stdout\']'),
        internalID: nextInternalID++
    };
    dom.data('components', components);
    components.buttonMinify.on('click', () => {
        toggleMinifyField(components);
    });
    components.buttonClose.on('click', () => {
        closeField(components);
    });
    return dom;
}


function toggleMinifyField(components) {
    if (components.dom.hasClass('minified')) {
        components.dom.removeClass('minified');
        components.dom.children().removeClass('minified');
    } else {
        components.dom.addClass('minified');
        components.dom.children().addClass('minified');
    }
}


function closeField(components) {
    components.dom.remove();
}