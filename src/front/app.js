var $ = require('jQuery');

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
});

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
