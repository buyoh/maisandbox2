
let $ = require('jQuery');
let socket = io.connect();


$(document).ready(function(){
	
	initializeAce();
	setupBackup();

	$("textarea.enabletabs").keydown(function(e){
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


function initializeAce(){
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

	$( "#aceditorEdge" ).on("onresize",function(){
		aceditor.resize();
	});
}


function initializeEvents(){

	// button
	$("#btn_exec").on("click", buttonRun);
	$("#btn_exec_build").on("click", buttonBuild);
	$("#btn_exec_run").on("click", buttonExecute);
	$("#btn_halt").on("click", buttonHalt);
	$("#btn_storeTemplate").on("click", storeTemplate);
	$("#btn_loadTemplate").on("click", loadTemplate);

	// another
	$("#selector_codelang").change(function(e){
		let dom = $("#selector_codelang option:selected");
		let cmd = dom.data("cmd");
		let edt = dom.data("edt");
		if (edt != "")
			changeCodeLang(cmd, edt);
	});
}


function setupBackup(){
	restoreBackup();
	$(window).on("unload", function(){storeBackup();});
	setInterval(function(){storeBackup();},1000*600);
}


function updateSelectorCodelang(catalog){
	let dom = $("#selector_codelang");

	let appVal = dom.data("apply");
	if (appVal) dom.data("apply", null);
	
	for (let i = 0; i < catalog.length; ++i){
		let c = catalog[i];
		$("<option></option")
			.data("cmd", c.cmd)
			.data("edt", c.editor)
			.text(c.name)
			.appendTo(dom);
	}

	if (appVal){
		$("#selector_codelang option")
			.filter((i,e)=>($(e).data("cmd")==appVal))
			.prop("selected", true);
	}
}


function updateRecipes(recipes){
	let domr = $("#div_recipes");
	domr.empty();
	for (let lang in recipes){
		let domc = $("<div></div>").data("cmd", lang);
		for (let name in recipes[lang]) {
			domc.append(
				$("<button></button>")
				.text(name)
				.on("click", {recipe: name}, buttonRecipe)
			);
		}
		domr.append(domc);
	}
}


function changeCodeLangEditor(cmd, edt){
	aceditor.getSession().setMode("ace/mode/"+edt);
}


function changeVisibleRecipes(cmd, edt){
	$("#div_recipes > div").filter((i,e)=>($(e).data("cmd")==cmd)).removeClass("invisible");
	$("#div_recipes > div").filter((i,e)=>($(e).data("cmd")!=cmd)).addClass("invisible");
}


function changeCodeLang(cmd, edt){
	changeCodeLangEditor(cmd, edt);
	changeVisibleRecipes(cmd, edt);
}


// _____________________________________________________
// getter


function getChosenLang(){
	return $("#selector_codelang option:selected").data("cmd");
}


function gatherInfo(){
	return {
		txt_stdin:   $("#txt_editstdin").val(),
		txt_code:    aceditor.getValue(),
		cmd:         getChosenLang(),
		timelimit:   $("#input_timeout").val()
	};
	/*
var flgDisableCleaning = $("#disableCleaning:checked").val();
var flagWAll = $("#flagWAll:checked").val();
var macro = $("#input_macro").val();
var source = $("#selector_sourcechooser").val();
var sourcepath = $("#input_filepath").val();
var filestdin = $('#chk_filestdin:checked').val();
var stdinpath = $('#input_stdinpath').val();
	*/
}


// _____________________________________________________
// display


function chooseLang(cmd){
	let dom = $("#selector_codelang option").filter((i,e)=>($(e).data("cmd")==cmd));
	if (dom.length > 0)
		dom.prop("selected", true);
	else
		$("#selector_codelang").data("apply", cmd);

	$("#selector_codelang").change();
}

/**
 * 
 * @param {string} message 
 * @param {string} classtype success,info,warning,danger
 */
function displayProgress(message, classtype){
	$("#div_progress")
		.text(message)
		.removeClass("alert-success alert-info alert-warning alert-danger")
		.addClass("alert-"+classtype);
}
function displayProgressNote(message){
	$("#div_progress_note").text(message);
}


function displayStdout(message){
	$("#txt_stdout").val(message);
}
function displayStderr(message){
	$("#div_stderr").text(message);
}


function clearResultLogs(){
	$("#div_resultlogs").empty();
}
function appendResultLog(title, message, classtype, isProgressing = false){
	const domrl = $("#div_resultlogs");
	if (domrl.last().data("isprog")){
		domrl.last().remove();
	}
	domrl.append(
		$("<div></div>")
		.data("isprog", isProgressing)
		.append(
			$("<div></div>").text(title)
			.removeClass("alert-success alert-info alert-warning alert-danger")
			.addClass("alert-"+classtype)
		)
		.append(
			$("<div></div>").text(message)
		)
	);
}


function changeStateExecButton(enabled = true){
	$("#btn_exec").prop("disabled", !enabled);
	$("#btn_exec_build").prop("disabled", !enabled);
	$("#btn_exec_run").prop("disabled", !enabled);
	$("#btn_halt").prop("disabled", !!enabled);
}


// _____________________________________________________
// backup


function restoreBackup(){
	let stored = localStorage.getItem("backup");
	if (!stored) return;
	
	let json = JSON.parse(stored);

	$("#txt_editstdin").val(json.txt_stdin);
	aceditor.setValue(json.txt_code, -1);

	chooseLang(json.cmd);
}


function storeBackup(){
	const json = {
		txt_stdin:   $("#txt_editstdin").val(),
		txt_code:    aceditor.getValue(),
		cmd:         getChosenLang()
	};
	localStorage.setItem("backup", JSON.stringify(json));
}


// _____________________________________________________
// template / snippet


function storeTemplate(){
	let stored = localStorage.getItem("template");
	let json = !stored ? {} : JSON.parse(stored);
	json[getChosenLang()] = aceditor.getValue();
	localStorage.setItem("template", JSON.stringify(json));
	console.log("complete store");
}


function loadTemplate(){
	let stored = localStorage.getItem("template");
	if (!stored) return;
	let val = JSON.parse(stored)[getChosenLang()];
	if (!val) return;
	aceditor.setValue(val, -1);
	console.log("complete load");
}



// _____________________________________________________
// tabs


function storeTabJson(json){
	localStorage.setItem("tabs", JSON.stringify(json));
}


function restoreTabJson(){
	let stored = localStorage.getItem("tabs");
	return !stored ? [] : JSON.parse(stored);
}


function unusedTabId(json){
	let ids = [];
	json.forEach(function(e,i,a){ if (e.id) ids.push(e.id); });
	let unusedId = null;
	ids.sort().forEach(function(e,i,a){ if (!unusedId && e !== i+1) unusedId = i; });

	return !unusedId ? ids.size()+1 : unusedId;
}


function createNewTabDom(id){
	let tabName = 'tab'+id;
	let li = $('<li></li>').addClass("nav-item");
	let a = $('<a href="#"></a>').addClass("nav-link");
	let close = $('<button></button>')
		.addClass("close")
		.text('&times;')
		.data("id", id)
		.on("click", function(){ closeTab($(this).data("id")); });
	
	a
		.append($('<span></span>').text(tabName))
		.append(close)
		.data("id", id)
		.on("click", function(){ switchTab($(this).data("id")); });

	$("#div_tablist").append(li.append(a));
}


function createNewTab(){
	let tab = {
		id: unusedTabId(),
		txt_code: '',
		cmd: getChosenLang()
	};

	let tabs = restoreTabJson();
	tabs.push(tab);
	storeTabJson(tabs);

	createNewTabDom(tab.id);
}


function switchTab(id){
	// 現在のタブを拾う
	// jsonを更新
	// idのタブを拾う
	// jsonを拾う
	// 更新する
}


function closeTab(id){

}


// _____________________________________________________
// events


// Legacy
function buttonRun(){
	const info = gatherInfo();
	info.query = "run";
	socket.emit("c2s_submit", info);
}

// Legacy
function buttonBuild(){
	const info = gatherInfo();
	info.query = "build";
	socket.emit("c2s_submit", info);
}

// Legacy
function buttonExecute(){
	const info = gatherInfo();
	info.query = "execute";
	socket.emit("c2s_submit", info);
}

// Legacy
function buttonHalt(){
	const info = gatherInfo();
	socket.emit("c2s_halt", info);
}


function buttonRecipe(e){
	const recipe = e.data.recipe;
	const info = gatherInfo();
	info.recipe = recipe;
	clearResultLogs();
	socket.emit("c2s_submit", info);
}

// _____________________________________________________
// socket


// connection test
socket.on("s2c_echo", function(data){
	console.log("echo:" + data.msg);
});


// 
socket.on("s2c_catalog", function(data){
	updateSelectorCodelang(data.taskTypeList);
	updateRecipes(data.recipes);
	$("#selector_codelang").change();
});


// submitしたtaskの状況がサーバから送られてくる
socket.on("s2c_progress", function(json){
	// console.log(json);
	// appendResultLog(json.type, json.data.stderr, "info", false);
	if (json.type === "prepare"){
		changeStateExecButton(false);
		displayProgress("prepare", "info");
		displayProgressNote("");
	}
	else if (json.type === "compile"){
		changeStateExecButton(false);
		displayProgress("compile", "info");
	}
	else if (json.type === "execute"){
		changeStateExecButton(false);
		displayProgress("execute", "info");
	}
	else if (json.type === "success"){
		changeStateExecButton(true);
		// console.log(json.data);
		displayStdout(json.data.stdout);
		displayStderr(json.data.stderr);
		displayProgress("success("+json.data.code+")", "success");
		displayProgressNote("compilation time: "+Math.round(json.data.time.compile)+"ms, execution time: "+Math.round(json.data.time.execute)+"ms");
	}
	else if (json.type === "failed"){
		changeStateExecButton(true);
		// console.log(json.data);
		displayStdout(json.data.stdout);
		displayStderr(json.data.stderr);
		displayProgress("failed("+json.data.code+")", "warning");
		displayProgressNote("compilation time: "+Math.round(json.data.time.compile)+"ms, execution time: "+Math.round(json.data.time.execute)+"ms");
	}
	else if (json.type === "error"){
		//console.log(json);
		displayProgress("error", "danger");
		changeStateExecButton(true);
	}
	else if (json.type === "log"){
		//console.log(json);
	}
	else {
		changeStateExecButton(true);
		//console.error(json);
	}
});
