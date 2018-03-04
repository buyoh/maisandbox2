
let $ = require('jQuery');
let socket = io.connect();


$(document).ready(function(){
	
	initializeAce();

	// loadBackup();
	// $(window).on("unload",saveBackup);
	// setInterval(function(){saveBackup();},1000*600);

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

	// another
	$("#selector_codelang").change(function(e){
		var edt = $("#selector_codelang option:selected").data("edt");
		if (edt != "")
			aceditor.getSession().setMode("ace/mode/"+edt);
	});
}


function updateSelectorCodelang(catalog){
	let dom = $("#selector_codelang");
	
	for (let i = 0; i < catalog.length; ++i){
		let c = catalog[i];
		dom.append("<option data-cmd='"+c.cmd+"' data-edt='"+c.editor+"'>"+c.name+"</option>");
	}
}

// _____________________________________________________
// utility


function gatherInfo(){
	return {
		txt_stdin:   $("#txt_editstdin").val(),
		txt_code:    aceditor.getValue(),
		cmd:         $("#selector_codelang option:selected").data("cmd"),
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

// _____________________________________________________
// events


function buttonExecute(){
	const info = gatherInfo();
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
});


// submitしたtaskの状況がサーバから送られてくる
socket.on("s2c_progress", function(json){
	// console.log(data);
	if (json.type === "prepare"){
		displayProgress("prepare", "info");
	}
	else if (json.type === "execute"){
		displayProgress("execute", "info");
	}
	else if (json.type === "success"){
		console.log(json.data);
		displayStdout(json.data.stdout);
		displayStderr(json.data.stderr);
		displayProgress("success("+json.data.code+")", "success");
	}
	else if (json.type === "failed"){
		console.log(json.data);
		displayStdout(json.data.stdout);
		displayStderr(json.data.stderr);
		displayProgress("failed", "warning");
	}
	else if (json.type === "error"){
		displayProgress("error", "danger");
	}
	else {
		console.error(json);
	}
});
