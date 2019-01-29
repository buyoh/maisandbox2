const $ = require('jQuery');

let domStdioTemplate = null;

// _____________________________________________________
// initialize

$(()=>{

    {
        const d = $("#div_stdios > .hiddenTemplate");
        d.removeClass("hiddenTemplate");
        domStdioTemplate = d.clone();
        d.remove();
    }
    appendField();
});

// _____________________________________________________
// getter / setter

export function getStdinLegacy(){
    return $("#div_stdios > div").eq(0).data("childlen").textareaStdin.val();
}
export function setStdinLegacy(text){
    return $("#div_stdios > div").eq(0).data("childlen").textareaStdin.val(text);
}
export function getStdoutLegacy(){
    return $("#div_stdios > div").eq(0).data("childlen").textareaStdout.val();
}
export function setStdoutLegacy(text){
    return $("#div_stdios > div").eq(0).data("childlen").textareaStdout.val(text);
}

// _____________________________________________________
// manipulate

export function appendField(){
    $("#div_stdios").append(generateDom());
}

// _____________________________________________________
// (internal)

function generateDom(){
    const dom = domStdioTemplate.clone();
    dom.data("childlen", {
        dom: dom,
        buttonMinify: dom.find("button[title='minify']"),
        buttonOpen: dom.find("button[title='open']"),
        buttonClose: dom.find("button[title='close']"),
        textareaStdin: dom.find("textarea[title='stdin']"),
        textareaStdout: dom.find("textarea[title='stdout']")
    });
    return dom;
}