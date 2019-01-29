const $ = require('jQuery');
const Interface = require('./interface');
const Editor = require('./aceditor');
const Storage = require('./storage');

const socket = io.connect();

$(()=>{
    $("textarea.enabletabs").keydown((e)=>{
        if (e.keyCode === 9) {
            e.preventDefault(); // デフォルト動作の中止
            var elem = e.target;
            var val = elem.value;
            var pos = elem.selectionStart;
            elem.value = val.substr(0, pos) + '\t' + val.substr(pos, val.length);
            elem.setSelectionRange(pos + 1, pos + 1);
        }
    });

    initializeEvents();

    socket.emit("c2s_getCatalog", {});
});


// _____________________________________________________
// initialize component

function initializeEvents(){

    // button
    $("#btn_halt").on("click", buttonHalt);
    $("#btn_storeTemplate").on("click", buttonStoreTemplate);
    $("#btn_loadTemplate").on("click", buttonLoadTemplate);

    // selector
    $("#selector_codelang").change(changeCodeLang);
}


// TODO: refactoring
function updateSelectorCodelang(catalog){
    let dom = $("#selector_codelang");

    let appVal = dom.data("apply");
    if (appVal) dom.data("apply", null);
    
    for (let i = 0; i < catalog.length; ++i){
        let c = catalog[i];
        $("<option></option")
            .data("cmd", c.cmd)
            .text(c.name)
            .appendTo(dom);
        Editor.registerLang(c.cmd, c.editor);
    }

    if (appVal){
        $("#selector_codelang option")
            .filter((i,e)=>($(e).data("cmd")==appVal))
            .prop("selected", true);
    }
}


// TODO: refactoring
function updateRecipes(recipes){
    const domr = $("#div_recipes");
    domr.empty();
    for (let lang in recipes){
        const domc = $("<div></div>").data("cmd", lang);
        for (let name in recipes[lang]) {
            domc.append(
                $("<button></button>")
                .addClass("btn btn-sm btn-primary")
                .text(name)
                .on("click", {recipe: name}, buttonRecipe)
            );
        }
        domr.append(domc);
    }
}


// TODO: refactoring
function updateOptions(options){
    const domr = $("#div_options");
    domr.empty();
    for (let lang in options){
        const domc = $("<div></div>").data("cmd", lang);
        for (let name in options[lang]) {
            const dom = $("<select></select>")
                .data("key", name)
                .addClass("form-control form-control-sm")
                .css("width", "inherit");
            for (let val of options[lang][name])
                dom.append(
                    $("<option></option>")
                    .text(val)
                    .val(val)
                );
            domc.append(
                $("<div></div>").addClass("keypair")
                .append($("<div></div>").addClass("key").text(name))
                .append(dom.addClass("val"))
            );
        }
        domr.append(domc);
    }
}


// _____________________________________________________
// events

function buttonHalt(){
    const info = Interface.gatherInfo();
    socket.emit("c2s_halt", info);
}


function buttonRecipe(e){
    const recipe = e.data.recipe;
    const info = Interface.gatherInfo();
    info.recipe = recipe;
    Interface.clearResultLogs();
    socket.emit("c2s_submit", info);
}


function buttonStoreTemplate(){
    Storage.storeTemplate(Interface.getChosenLang(), Editor.getValue());
}

function buttonLoadTemplate(){
    Editor.setValue(Storage.loadTemplate(Interface.getChosenLang()));
}


function changeCodeLang(){
    let dom = $("#selector_codelang option:selected");
    let cmd = dom.data("cmd");
    if (cmd === "") return;

    Interface.changeVisibleRecipes(cmd);
}

// _____________________________________________________
// socket


// connection test
socket.on("s2c_echo", (data)=>{
    console.log("echo:" + data.msg);
});


// 
socket.on("s2c_catalog", (data)=>{
    updateSelectorCodelang(data.taskTypeList);
    updateRecipes(data.recipes);
    updateOptions(data.options);
    $("#selector_codelang").change();
});


// submitしたtaskの状況がサーバから送られてくる
socket.on("s2c_progress", (json)=>{
    // console.log(json);

    if (json.type === "halted"){
        Interface.appendResultLog("halted", "", "info");
        return;
    }

    if (json.type === "success"){
        Interface.displayStdout(
            $("#div_resultlogs > div").first().find(".val")
            .filter((i,e)=>($(e).data("key")=="stdout"))
            .text()
        );
    }
    
    const state = 
        json.type === "continue" || json.type === "success" ? "success" :
        json.type === "failed" ? "warning" : 
        json.type === "error" ? "danger" : 
        "info";

    Interface.appendResultLog(
        json.data.taskName ? "[" + json.data.taskName + "]"+json.type : json.type,
        json.data, state, json.type === "progress"
    );

    if (json.data.info) {
        Editor.setAnnotations(json.data.info);
    }

});
