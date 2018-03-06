
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
	$("#btn_exec").on("click", buttonExecute);
	$("#btn_halt").on("click", buttonHalt);
	$("#btn_storeTemplate").on("click", buttonStoreTemplate);
	$("#btn_loadTemplate").on("click", buttonLoadTemplate);

	// another
	$("#selector_codelang").change(function(e){
		var edt = $("#selector_codelang option:selected").data("edt");
		if (edt != "")
			aceditor.getSession().setMode("ace/mode/"+edt);
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
		dom.append("<option data-cmd='"+c.cmd+"' data-edt='"+c.editor+"'>"+c.name+"</option>");
	}

	if (appVal)
		$("#selector_codelang option[data-cmd='"+appVal+"']").prop("selected", true);

}

// _____________________________________________________
// utility


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


function displayStdout(message){
	$("#txt_stdout").val(message);
}
function displayStderr(message){
	$("#div_stderr").text(message);
}


function changeStateExecButton(enabled = true){
	$("#btn_exec").prop("disabled", !enabled);
	$("#btn_exec_redo").prop("disabled", !enabled);
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

	let dom = $("#selector_codelang option[data-cmd='"+json.cmd+"']");
	if (dom.length > 0)
		dom.prop("selected", true);
	else
		$("#selector_codelang").data("apply", json.cmd);
	
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


function buttonStoreTemplate(){
	let stored = localStorage.getItem("template");
	let json = !stored ? {} : JSON.parse(stored);
	json[getChosenLang()] = aceditor.getValue();
	localStorage.setItem("template", JSON.stringify(json));
	console.log("complete store");
}


function buttonLoadTemplate(){
	let stored = localStorage.getItem("template");
	console.log(stored);
	if (!stored) return;
	let val = JSON.parse(stored)[getChosenLang()];
	if (!val) return;
	aceditor.setValue(val, -1);
	console.log("complete load");
}


// _____________________________________________________
// events


function buttonExecute(){
	const info = gatherInfo();
	socket.emit("c2s_submit", info);
}

function buttonHalt(){
	const info = gatherInfo();
	socket.emit("c2s_halt", info);
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
});


// submitしたtaskの状況がサーバから送られてくる
socket.on("s2c_progress", function(json){
	// console.log(data);
	if (json.type === "prepare"){
		changeStateExecButton(false);
		displayProgress("prepare", "info");
	}
	else if (json.type === "compile"){
		changeStateExecButton(false);
		displayProgress("prepare", "info");
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
	}
	else if (json.type === "failed"){
		changeStateExecButton(true);
		// console.log(json.data);
		displayStdout(json.data.stdout);
		displayStderr(json.data.stderr);
		displayProgress("failed("+json.data.code+")", "warning");
	}
	else if (json.type === "error"){
		displayProgress("error", "danger");
	}
	else if (json.type === "log"){
		console.log(log);
	}
	else {
		changeStateExecButton(true);
		console.error(json);
	}
});
