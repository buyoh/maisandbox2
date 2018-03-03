
var $ = require('jQuery');
var socket = io.connect();


$(document).ready(function(){
	
	initializeAce();

	$("#selector_codelang")
		.append("<option data-lang='Ruby' data-env='cyg'>Ruby/cgi(cygwin)</option>")
		.append("<option data-lang='Ruby' data-env='win'>Ruby/cgi(cmd)</option>")
		.append("<option data-lang='C++14' data-env='cyg'>C++14(opt)/cgi(cygwin)</option>")
		//.append("<option data-lang='Rust' data-env='win'>Rust(opt)/cgi(cmd)</option>")
		.append("<option data-lang='Rust' data-env='bash'>Rust(opt)/server(bash)</option>")
		//.append("<option data-lang='Rust-D' data-env='bash'>Rust(dbg)/BoW</option>")
		.append("<option data-lang='Brainfuck' data-env='win'>Brainfuck/cgi(cmd)</option>")
		//.append("<option>C#</option>")
		//.append("<option>Custom</option>")
		.append("<option data-lang='PyPy' data-env='bash'>PyPy/server(bash)</option>")
		.append("<option data-lang='Python' data-env='bash'>Python3/server(bash)</option>")
		.append("<option data-lang='Crystal' data-env='bash'>Crystal/server(bash)</option>");
	// .append("<option>Java</option>").append("<option>Crystal</option>")

	$("#selector_codelang").change(function(e){
		var clang=$("#selector_codelang option:selected").data("lang");
		switch (clang){
			case "Ruby":
			case "Crystal":
				aceditor.getSession().setMode("ace/mode/ruby");
				break;
			case "C++14":
				aceditor.getSession().setMode("ace/mode/c_cpp");
				break;
			case "Rust":
				aceditor.getSession().setMode("ace/mode/rust");
				break;
			case "Python":
			case "PyPy":
				aceditor.getSession().setMode("ace/mode/python");
				break;
			default:
				break;
		}
	});

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

	$("#btn_exec").on("click", buttonExecute);
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


// _____________________________________________________
// utility


function gatherInfo(){
	return {
		txt_stdin:   $("#txt_editstdin").val(),
		txt_code:    aceditor.getValue(),
		lang:        $("#selector_codelang option:selected").data("lang"),
		environment: $("#selector_codelang option:selected").data("env"),
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
		displayProgress("success(AC)", "success");
	}
	else if (json.type === "error"){
		displayProgress("error", "danger");
	}
	else {
		console.error(json);
	}
});

